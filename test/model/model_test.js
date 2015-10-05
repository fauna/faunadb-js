import {assert} from 'chai'
import {assertRejected, client} from '../util'
import {InvalidValue, InvalidQuery, NotFound} from '../../src/errors'
import {Class} from '../../src/model/Builtin'
import Model from '../../src/model/Model'
import {Ref} from '../../src/objects'

let MyModel

describe('Model', () => {
  before(async function() {
    MyModel = class MyModel extends Model {}
    MyModel.setup('my_models', {number: {}, letter: {}})
    await Class.createForModel(client, MyModel)
  })

  it('common fields', async function() {
    const instance = await MyModel.create(client)
    assert.instanceOf(instance.ref, Ref)
    assert.typeOf(instance.ts, 'number')
    assert.equal(instance.id, instance.ref.id)
  })

  it('persistence', async function() {
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

  it('replace', async function() {
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

  it('replace with new fields', async function() {
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

  it('ref, id, ts', async function() {
    const it = new MyModel(client, {number: 1, letter: 'a'})

    assert.throws(() => it.ref, InvalidQuery)
    assert.throws(() => it.id, InvalidQuery)
    assert.throws(() => it.ts, InvalidQuery)

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

  it('update', async function() {
    const it = new MyModel(client, {number: {a: {b: 1, c: 2}}})
    await it.save()

    it.number.a.b = -1
    it.number.a.d = {e: 3}
    assert.deepEqual(it._diff(), {data: {number: {a: {b: -1, d: {e: 3}}}}})

    await it.save()
    assert.deepEqual(await MyModel.get(client, it.ref), it)
  })

  it('toString', () => {
    const m = new MyModel(client, {number: 1, letter: 2})
    assert.equal(m.toString(), 'MyModel(number: 1, letter: 2)')
  })
})
