import {assert} from 'chai'
import {assertRejected, client} from '../util'
import {InvalidValue, NotFound} from '../../src/errors'
import {Class} from '../../src/model/Builtin'
import Model from '../../src/model/Model'
import {Ref} from '../../src/objects'
import * as query from '../../src/query'

let MyModel

describe('Model', () => {
  before(async () => {
    MyModel = class MyModel extends Model {}
    MyModel.setup('my_models', {number: {}, letter: {}})
    await Class.createForModel(client, MyModel)
  })

  it('common fields', async () => {
    const instance = await MyModel.create(client)
    assert.instanceOf(instance.ref, Ref)
    assert.typeOf(instance.ts, 'number')
    assert.equal(instance.id, instance.ref.id)
  })

  it('persistence', async () => {
    const it = new MyModel(client, {number: 1, letter: 'a'})

    const get = () => MyModel.get(client, it.ref)

    assert(it.isNewInstance())

    await it.save()
    assert(!it.isNewInstance())
    assert.deepEqual(await get(), it)

    it.number = 2
    assert.deepEqual(it._diff(), {data: {number: 2}})
    await it.save()
    assert.deepEqual(it._diff(), {})
    assert.deepEqual(await get(), it)

    await it.delete()

    assertRejected(it.delete(), NotFound)
  })

  it('bad field', () => {
    assert.throws(() => new MyModel(client, {nubber: 1}), InvalidValue)
  })

  it('replace', async () => {
    const it = new MyModel(client, {number: 1, letter: 'a'})
    await it.save()

    const get = () => MyModel.get(client, it.ref)

    const copy = await get()

    copy.number = 2
    await copy.save()

    it.letter = 'b'
    // This will only update the 'letter' property.
    await it.save()

    const got = await get()
    assert.equal(got.number, 2)
    assert.equal(got.letter, 'b')

    copy.number = 3
    await copy.save()

    it.letter = 'c'
    await it.save(true)

    assert.deepEqual(await get(), it)
  })

  it('replace with new fields', async () => {
    class GrowModel extends Model {}
    GrowModel.setup('grow_models', {number: {}})
    await Class.createForModel(client, GrowModel)

    let g = new GrowModel(client, {number: 1})
    await g.save()

    GrowModel.addField('letter')
    g = await GrowModel.get(client, g.ref)
    g.letter = 'a'
    await g.save(true)

    assert.equal(g.number, 1)
    assert.equal(g.letter, 'a')
    assert.deepEqual(await GrowModel.get(client, g.ref), g)
  })

  it('ref, id, ts', async () => {
    const it = new MyModel(client, {number: 1, letter: 'a'})

    assert.equal(it.ref, null)
    assert.equal(it.id, null)
    assert.equal(it.ts, null)

    await it.save()
    assert(it.ref != null && it.ts != null)
    assert(it.id === it.ref.id)
    const ref1 = it.ref
    const ts1 = it.ts

    it.number = 2
    await it.save()
    assert.deepEqual(it.ref, ref1)
    assert(it.ts != null && it.ts !== ts1)
  })

  it('update', async () => {
    const it = new MyModel(client, {number: {a: {b: 1, c: 2}}})
    await it.save()

    it.number.a.b = -1
    it.number.a.d = {e: 3}
    assert.deepEqual(it._diff(), {data: {number: {a: {b: -1, d: {e: 3}}}}})

    await it.save()
    assert.deepEqual(await MyModel.get(client, it.ref), it)
  })

  it('stream', async () => {
    const indexRef = (await client.post('indexes', {
      name: 'my_models_by_number',
      source: MyModel.classRef,
      terms: [{path: 'data.number'}],
      active: true
    })).ref

    const
      a = await MyModel.create(client, {number: 12}),
      b = await MyModel.create(client, {number: 12})

    const instanceSet = query.match(indexRef, 12)
    const stream = MyModel.stream(client, instanceSet)
    assert.deepEqual(await stream.all(), [a, b])
  })

  it('toString', () => {
    const m = new MyModel(client, {number: 1, letter: 2})
    assert.equal(m.toString(), 'MyModel(number: 1, letter: 2)')
  })
})
