import {assert} from 'chai'
import {BadRequest, NotFound} from '../src/errors'
import {FaunaDate, FaunaTime, Ref, SetRef} from '../src/objects'
import * as query from '../src/query'
import {assertRejected, client, getClient} from './util'

let classRef, nIndexRef, mIndexRef, refN1, refM1, refN1M1, thimbleClassRef

describe('query', () => {
  before(async () => {
    classRef = (await client.post('classes', {name: 'widgets'})).ref

    nIndexRef = (await client.post('indexes', {
      name: 'widgets_by_n',
      source: classRef,
      path: 'data.n',
      active: true
    })).ref

    mIndexRef = (await client.post('indexes', {
      name: 'widgets_by_m',
      source: classRef,
      path: 'data.m',
      active: true
    })).ref

    refN1 = (await create({n: 1})).ref
    refM1 = (await create({m: 1})).ref
    refN1M1 = (await create({n: 1, m: 1})).ref

    thimbleClassRef = (await client.post('classes', {name: 'thimbles'})).ref
  })

  // Basic forms

  it('Expr inspect', () => {
    const expr = query.add(1, query.divide(4, 2))
    assert.equal('Expr({"add":[1,{"divide":[4,2]}]})', expr.inspect())
  })

  it('let/var', async () => {
    await assertQuery(query.let_expr({x: 1}, query.variable('x')), 1)
  })

  it('if', async () => {
    await assertQuery(query.if_expr(true, 't', 'f'), 't')
    await assertQuery(query.if_expr(false, 't', 'f'), 'f')
  })

  it('do', async () => {
    const ref = (await create()).ref
    await assertQuery(query.do_expr(query.delete_expr(ref), 1), 1)
    await assertQuery(query.exists(ref), false)
  })

  it('lambda', async () => {
    assert.throws(() => query.lambda(() => 0))

    assert.deepEqual(
      query.toQuery(a => query.add(a, a)),
      {lambda: 'a', expr: {add: [{var: 'a'}, {var: 'a'}]}})

    const multi_args = query.toQuery((a, b) => [b, a])
    assert.deepEqual(multi_args, {
      lambda: ['a', 'b'],
      expr: [{var: 'b'}, {var: 'a'}]
    })
    await assertQuery(query.map([[1, 2], [3, 4]], new query.Expr(multi_args)), [[2, 1], [4, 3]])

    // function() works too
    assert.deepEqual(multi_args, query.toQuery(function(a, b) { return [b, a] }))
  })

  // Collection functions

  it('map', async () => {
    await assertQuery(query.map([1, 2, 3], a => query.multiply([2, a])), [2, 4, 6])
    // Should work for manually constructed lambda too.
    await assertQuery(
      query.map([1, 2, 3], query.lambda_expr('a', query.multiply([2, query.variable('a')]))),
      [2, 4, 6])

    const page = query.paginate(nSet(1))
    const ns = query.map(page, a => query.select(['data', 'n'], query.get(a)))
    assertQuery(ns, {data: [1, 1]})
  })

  it('foreach', async () => {
    const refs = [(await create()).ref, (await create()).ref]
    await client.query(query.foreach(refs, query.delete_expr))
    for (const ref of refs)
      await assertQuery(query.exists(ref), false)
  })


  it('filter', async () => {
    await assertQuery(query.filter([1, 2, 3, 4], a => query.equals(query.modulo(a, 2), 0)), [2, 4])

    // Works on page too
    const page = query.paginate(nSet(1))
    const refsWithM = query.filter(page, a =>
      query.contains(['data', 'm'], query.get(a)))
    await assertQuery(refsWithM, {data: [refN1M1]})
  })

  it('take', async () => {
    await assertQuery(query.take(1, [1, 2]), [1])
    await assertQuery(query.take(3, [1, 2]), [1, 2])
    await assertQuery(query.take(-1, [1, 2]), [])
  })

  it('drop', async () => {
    await assertQuery(query.drop(1, [1, 2]), [2])
    await assertQuery(query.drop(3, [1, 2]), [])
    await assertQuery(query.drop(-1, [1, 2]), [1, 2])
  })

  it('prepend', async () => {
    await assertQuery(query.prepend([1, 2, 3], [4, 5, 6]), [1, 2, 3, 4, 5, 6])
    // Fails for non-array.
    await assertBadQuery(query.prepend([1, 2], 'foo'))
  })

  it('append', async () => {
    await assertQuery(query.append([4, 5, 6], [1, 2, 3]), [1, 2, 3, 4, 5, 6])
    // Fails for non-array.
    await assertBadQuery(query.append([1, 2], 'foo'))
  })

  // Read functions

  it('get', async () => {
    const instance = await create()
    await assertQuery(query.get(instance.ref), instance)
  })

  it('paginate', async () => {
    const testSet = nSet(1)
    await assertQuery(query.paginate(testSet), {data: [refN1, refN1M1]})
    await assertQuery(query.paginate(testSet, {size: 1}), {data: [refN1], after: [refN1M1]})
    await assertQuery(query.paginate(testSet, {sources: true}), {
      data: [
        {sources: [new SetRef(testSet)], value: refN1},
        {sources: [new SetRef(testSet)], value: refN1M1}
      ]
    })
  })

  it('exists', async () => {
    const ref = (await create()).ref
    await assertQuery(query.exists(ref), true)
    await client.query(query.delete_expr(ref))
    await assertQuery(query.exists(ref), false)
  })

  it('count', async () => {
    await create({n: 123})
    await create({n: 123})
    const instances = nSet(123)
    // `count` is currently only approximate. Should be 2.
    assert.typeOf(await client.query(query.count(instances)), 'number')
  })

  // Write functinos

  it('create', async () => {
    const instance = await create()
    assert('ref' in instance)
    assert('ts' in instance)
    assert.deepEqual(instance.class, classRef)
  })

  it('update', async () => {
    const ref = (await create()).ref
    const got = await client.query(query.update(ref, {data: {m: 9}}))
    assert.deepEqual(got.data, {n: 0, m: 9})
  })

  it('replace', async () => {
    const ref = (await create()).ref
    const got = await client.query(query.replace(ref, {data: {m: 9}}))
    assert.deepEqual(got.data, {m: 9})
  })

  it('delete', async () => {
    const ref = (await create()).ref
    await client.query(query.delete_expr(ref))
    await assertQuery(query.exists(ref), false)
  })

  it('insert', async () => {
    const instance = await createThimble({weight: 1})
    const ref = instance.ref, ts = instance.ts
    const prevTs = ts - 1

    // Add previous event
    const inserted = {data: {weight: 0}}
    await client.query(query.insert(ref, prevTs, 'create', inserted))

    // Get version from previous event
    const old = await client.query(query.get(ref, prevTs))
    assert.deepEqual(old.data, {weight: 0})
  })

  it('remove', async () => {
    const instance = await createThimble({weight: 0})
    const ref = instance.ref

    // Change it
    const newInstance = await client.query(query.replace(ref, {data: {weight: 1}}))
    await assertQuery(query.get(ref), newInstance)

    // Delete that event
    await client.query(query.remove(ref, newInstance.ts, 'create'))

    // Assert that it was undone
    await assertQuery(query.get(ref), instance)
  })

  // Sets

  it('match', async () => {
    await assertSet(nSet(1), [refN1, refN1M1])
  })

  it('union', async () => {
    await assertSet(query.union(nSet(1), mSet(1)), [refN1, refM1, refN1M1])
  })

  it('intersection', async () => {
    await assertSet(query.intersection(nSet(1), mSet(1)), [refN1M1])
  })

  it('difference', async () => {
    await assertSet(query.difference(nSet(1), mSet(1)), [refN1]) // but not refN1M1
  })

  it('join', async () => {
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
    const joined = query.join(source, a => query.match(mIndexRef, a))
    await assertSet(joined, referencers)
  })

  // Authentication

  it('login/logout', async () => {
    const instanceRef = (await client.query(
      query.create(classRef, {credentials: {password: 'sekrit'}}))).ref
    const secret = (await client.query(
      query.login(instanceRef, {password: 'sekrit'}))).secret
    const instanceClient = getClient({secret: {user: secret}})

    assert.deepEqual(
      await instanceClient.query(
        query.select('ref', query.get(new Ref('classes/widgets/self')))),
      instanceRef)

    assert.isTrue(await instanceClient.query(query.logout(true)))
  })

  it('identify', async () => {
    const instanceRef = (await client.query(
      query.create(classRef, {credentials: {password: 'sekrit'}}))).ref
    await assertQuery(query.identify(instanceRef, 'sekrit'), true)
  })

  // String functions

  it('concat', async () => {
    await assertQuery(query.concat(['a', 'b', 'c']), 'abc')
    await assertQuery(query.concat([]), '')
    await assertQuery(query.concat(['a', 'b', 'c'], '.'), 'a.b.c')
  })

  it('casefold', async () => {
    await assertQuery(query.casefold('Hen Wen'), 'hen wen')
  })

  // Time and date functions

  it('time', async () => {
    const time = '1970-01-01T00:00:00.123456789Z'
    await assertQuery(query.time(time), new FaunaTime(time))
    // 'now' refers to the current time.
    assert.instanceOf(await client.query(query.time('now')), FaunaTime)
  })

  it('epoch', async () => {
    await assertQuery(query.epoch(12, 'second'), new FaunaTime('1970-01-01T00:00:12Z'))
    const nanoTime = new FaunaTime('1970-01-01T00:00:00.123456789Z')
    await assertQuery(query.epoch(123456789, 'nanosecond'), nanoTime)
  })

  it('date', async () => {
    await assertQuery(query.date('1970-01-01'), new FaunaDate('1970-01-01'))
  })

  // Miscellaneous functions

  it('equals', async () => {
    await assertQuery(query.equals(1, 1, 1), true)
    await assertQuery(query.equals(1, 1, 2), false)
    await assertQuery(query.equals(1), true)
    await assertBadQuery(query.equals())
  })

  it('contains', async () => {
    const obj = {a: {b: 1}}
    await assertQuery(query.contains(['a', 'b'], obj), true)
    await assertQuery(query.contains('a', obj), true)
    await assertQuery(query.contains(['a', 'c'], obj), false)
  })

  it('select', async () => {
    const obj = {a: {b: 1}}
    await assertQuery(query.select('a', obj), {b: 1})
    await assertQuery(query.select(['a', 'b'], obj), 1)
    await assertQuery(query.selectWithDefault('c', obj, null), null)
    await assertBadQuery(query.select('c', obj), NotFound)
  })

  it('select for array', async () => {
    const arr = [1, 2, 3]
    await assertQuery(query.select(2, arr), 3)
    await assertBadQuery(query.select(3, arr), NotFound)
  })

  it('add', async () => {
    await assertQuery(query.add(2, 3, 5), 10)
    await assertBadQuery(query.add())
  })

  it('multiply', async () => {
    await assertQuery(query.multiply(2, 3, 5), 30)
    await assertBadQuery(query.multiply())
  })

  it('subtract', async () => {
    await assertQuery(query.subtract(2, 3, 5), -6)
    await assertQuery(query.subtract(2), 2)
    await assertBadQuery(query.subtract())
  })

  it('divide', async () => {
    // TODO: can't make this query because 2.0 === 2
    // await assertQuery(query.divide(2, 3, 5), 2/15)
    await assertQuery(query.divide(2), 2)
    await assertBadQuery(query.divide(1, 0))
    await assertBadQuery(query.divide())
  })

  it('modulo', async () => {
    await assertQuery(query.modulo(5, 2), 1)
    // This is (15 % 10) % 2
    await assertQuery(query.modulo(15, 10, 2), 1)
    await assertQuery(query.modulo(2), 2)
    await assertBadQuery(query.modulo(1, 0))
    await assertBadQuery(query.modulo())
  })

  it('lt', async () => {
    await assertQuery(query.lt(1, 2), true)
  })

  it('lte', async () => {
    await assertQuery(query.lte(1, 1), true)
  })

  it('gt', async () => {
    await assertQuery(query.gt(2, 1), true)
  })

  it('gte', async () => {
    await assertQuery(query.gte(1, 1), true)
  })

  it('and', async () => {
    await assertQuery(query.and(true, true, false), false)
    await assertQuery(query.and(true, true, true), true)
    await assertQuery(query.and(true), true)
    await assertQuery(query.and(false), false)
    await assertBadQuery(query.and())
  })

  it('or', async () => {
    await assertQuery(query.or(false, false, true), true)
    await assertQuery(query.or(false, false, false), false)
    await assertQuery(query.or(true), true)
    await assertQuery(query.or(false), false)
    await assertBadQuery(query.or())
  })

  it('not', async () => {
    await assertQuery(query.not(true), false)
    await assertQuery(query.not(false), true)
  })

  // Helpers

  it('varargs', async () => {
    // Works for lists too
    await assertQuery(query.add([2, 3, 5]), 10)
    // Works for a variable equal to a list
    await assertQuery(query.let_expr({x: [2, 3, 5]}, query.add(query.variable('x'))), 10)
  })
})

function create(data={}) {
  if (data.n === undefined)
    data.n = 0
  return client.query(query.create(classRef, {data}))
}
function createThimble(data) {
  return client.query(query.create(thimbleClassRef, {data}))
}

function nSet(n) {
  return query.match(nIndexRef, n)
}
function mSet(m) {
  return query.match(mIndexRef, m)
}

async function assertQuery(query, expected) {
  assert.deepEqual(await client.query(query), expected)
}
async function assertBadQuery(query, errorType=BadRequest) {
  await assertRejected(client.query(query), errorType)
}
async function assertSet(set, expected) {
  assert.deepEqual(await getSetContents(set), expected)
}
async function getSetContents(set) {
  return (await client.query(query.paginate(set, {size: 1000}))).data
}
