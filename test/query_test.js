import {assert} from 'chai'
import {BadRequest, NotFound} from '../src/errors'
import {FaunaSet} from '../src/objects'
import * as query from '../src/query'
import {assertRejected, client} from './util'

let class_ref, nIndexRef, mIndexRef, refN1, refM1, refN1M1

describe('query', () => {
  before(async function() {
    class_ref = (await client.post('classes', {name: 'widgets'})).ref

    nIndexRef = (await client.post('indexes', {
      name: 'widgets_by_n',
      source: class_ref,
      path: 'data.n',
      active: true
    })).ref

    mIndexRef = (await client.post('indexes', {
      name: 'widgets_by_m',
      source: class_ref,
      path: 'data.m',
      active: true
    })).ref

    refN1 = (await create({n: 1})).ref
    refM1 = (await create({m: 1})).ref
    refN1M1 = (await create({n: 1, m: 1})).ref
  })

  it('let/var', async function() {
    await assertQuery(query.let_expr({x: 1}, query.variable('x')), 1)
  })

  it('if', async function() {
    await assertQuery(query.if_expr(true, 't', 'f'), 't')
    await assertQuery(query.if_expr(false, 't', 'f'), 'f')
  })

  it('do', async function() {
    const ref = (await create()).ref
    await assertQuery(query.do_expr(query.delete_expr(ref), 1), 1)
    await assertQuery(query.exists(ref), false)
  })

  it('object', async function() {
    const obj = query.object({x: query.let_expr({x: 1}, query.variable('x'))})
    await assertQuery(obj, {x: 1})
  })

  it('quote', async function() {
    const quoted = query.let_expr({x: 1}, query.variable('x'))
    await assertQuery(query.quote(quoted), quoted)
  })

  it('map', async function() {
    // This is also test for query.lambda (can't test that alone)
    const double = query.lambda('x', query.multiply([2, query.variable('x')]))
    await assertQuery(query.map(double, [1, 2, 3]), [2, 4, 6])

    const getN = query.lambda('x', query.select(['data', 'n'], query.get(query.variable('x'))))
    const page = query.paginate(nSet(1))
    const ns = query.map(getN, page)
    assert.deepEqual((await client.query(ns)).data, [1, 1])
  })

  it('foreach', async function() {
    const refs = [(await create()).ref, (await create()).ref]
    await client.query(
      query.foreach(query.lambda('x', query.delete_expr(query.variable('x'))), refs))
    for (const ref of refs)
      await assertQuery(query.exists(ref), false)
  })

  it('get', async function() {
    const instance = await create()
    await assertQuery(query.get(instance.ref), instance)
  })

  it('paginate', async function() {
    const testSet = nSet(1)
    await assertQuery(query.paginate(testSet), {data: [refN1, refN1M1]})
    await assertQuery(query.paginate(testSet, {size: 1}), {data: [refN1], after: refN1M1})
    await assertQuery(query.paginate(testSet, {sources: true}), {
      data: [
        {sources: [new FaunaSet(testSet)], value: refN1},
        {sources: [new FaunaSet(testSet)], value: refN1M1}
      ]
    })
  })

  it('exists', async function() {
    const ref = (await create()).ref
    await assertQuery(query.exists(ref), true)
    await client.query(query.delete_expr(ref))
    await assertQuery(query.exists(ref), false)
  })

  it('count', async function() {
    await create({n: 123})
    await create({n: 123})
    const instances = nSet(123)
    // `count` is currently only approximate. Should be 2.
    assert.typeOf(await client.query(query.count(instances)), 'number')
  })

  it('create', async function() {
    const instance = await create()
    assert('ref' in instance)
    assert('ts' in instance)
    assert.deepEqual(instance.class, class_ref)
  })

  it('update', async function() {
    const ref = (await create()).ref
    const got = await client.query(query.update(ref, query.quote({data: {m: 9}})))
    assert.deepEqual(got.data, {n: 0, m: 9})
  })

  it('replace', async function() {
    const ref = (await create()).ref
    const got = await client.query(query.replace(ref, query.quote({data: {m: 9}})))
    assert.deepEqual(got.data, {m: 9})
  })

  it('delete', async function() {
    const ref = (await create()).ref
    await client.query(query.delete_expr(ref))
    await assertQuery(query.exists(ref), false)
  })

  it('match', async function() {
    await assertSet(nSet(1), [refN1, refN1M1])
  })

  it('union', async function() {
    await assertSet(query.union(nSet(1), mSet(1)), [refN1, refM1, refN1M1])
  })

  it('intersection', async function() {
    await assertSet(query.intersection(nSet(1), mSet(1)), [refN1M1])
  })

  it('difference', async function() {
    await assertSet(query.difference(nSet(1), mSet(1)), [refN1]) // but not refN1M1
  })

  it('join', async function() {
    const referenced = [
      (await create({n: 12})).ref,
      (await create({n: 12})).ref
    ]
    const referencers = [
      (await create({m: referenced[0]})).ref,
      (await create({m: referenced[1]})).ref
    ]

    const source = nSet(12)
    await assertSet(source, referenced)

    // For each obj with n=12, get the set of elements whose data.m refers to it.
    const joined = query.join(
      source,
      query.lambda(
        'x',
        query.match(query.variable('x'), mIndexRef)))
    await assertSet(joined, referencers)
  })

  it('equals', async function() {
    await assertQuery(query.equals(1, 1, 1), true)
    await assertQuery(query.equals(1, 1, 2), false)
    await assertQuery(query.equals(1), true)
    await assertBadQuery(query.equals())
  })

  it('concat', async function() {
    await assertQuery(query.concat('a', 'b', 'c'), 'abc')
    await assertQuery(query.concat(), '')
  })

  it('contains', async function() {
    const obj = query.quote({a: {b: 1}})
    await assertQuery(query.contains(['a', 'b'], obj), true)
    await assertQuery(query.contains('a', obj), true)
    await assertQuery(query.contains(['a', 'c'], obj), false)
  })

  it('select', async function() {
    const obj = query.quote({a: {b: 1}})
    await assertQuery(query.select('a', obj), {b: 1})
    await assertQuery(query.select(['a', 'b'], obj), 1)
    await assertQuery(query.selectWithDefault('c', obj, null), null)
    await assertBadQuery(query.select('c', obj), NotFound)
  })

  it('select for array', async function() {
    const arr = [1, 2, 3]
    await assertQuery(query.select(2, arr), 3)
    await assertBadQuery(query.select(3, arr), NotFound)
  })

  it('add', async function() {
    await assertQuery(query.add(2, 3, 5), 10)
    await assertBadQuery(query.add())
  })

  it('multiply', async function() {
    await assertQuery(query.multiply(2, 3, 5), 30)
    await assertBadQuery(query.multiply())
  })

  it('subtract', async function() {
    await assertQuery(query.subtract(2, 3, 5), -6)
    await assertQuery(query.subtract(2), 2)
    await assertBadQuery(query.subtract())
  })

  it('divide', async function() {
    // TODO: can't make this query because 2.0 === 2
    // await assertQuery(query.divide(2, 3, 5), 2/15)
    await assertQuery(query.divide(2), 2)
    await assertBadQuery(query.divide(1, 0))
    await assertBadQuery(query.divide())
  })

  it('varargs', async function() {
    // Works for lists too
    await assertQuery(query.add([2, 3, 5]), 10)
    // Works for a variable equal to a list
    await assertQuery(query.let_expr({x: [2, 3, 5]}, query.add(query.variable('x'))), 10)
  })
})

const
  create = (data={}) => {
    if (data.n === undefined)
      data.n = 0
    return client.query(query.create(class_ref, query.quote({data})))
  },
  nSet = n =>
    query.match(n, nIndexRef),
  mSet = m =>
    query.match(m, mIndexRef)

async function assertQuery(query, expected) {
  assert.deepEqual(await client.query(query), expected)
}
async function assertBadQuery(query, errorType=BadRequest) {
  assertRejected(client.query(query), errorType)
}
async function assertSet(set, expected) {
  assert.deepEqual(await getSetContents(set), expected)
}
async function getSetContents(set) {
  return (await client.query(query.paginate(set, {size: 1000}))).data
}
