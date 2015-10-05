import {assert} from 'chai'
import {client} from '../util'
import {InvalidValue} from '../../src/errors'
import {Class} from '../../src/model/Builtin'
import {RefCodec} from '../../src/model/Codec'
import Field from '../../src/model/Field'
import Model from '../../src/model/Model'

let MyModel, instance

describe('Codec', () => {
  before(async function() {
    const DoubleCodec = {
      encode(value) {
        return value + value
      },
      decode(raw) {
        const half = raw.length / 2
        assert.equal(raw.slice(0, half), raw.slice(half))
        return raw.slice(0, half)
      }
    }

    MyModel = class MyModel extends Model { }
    MyModel.setup('pikachus', {
      plainField: {},
      codecField: {codec: DoubleCodec},
      refField: {codec: new RefCodec(MyModel)}
    })
    await Class.createForModel(client, MyModel)

    instance = new MyModel(client, {plainField: 1, codecField: 'doubleme'})
  })

  it('model fields', () => {
    class MyModel extends Model {}
    MyModel.setup('my_models', {
      plainField: {},
      refField: {codec: new RefCodec(MyModel)}
    })

    assert.deepEqual(MyModel.fields, {
      plainField: new Field({path: ['data', 'plainField']}),
      refField: new Field({codec: new RefCodec(MyModel), path: ['data', 'refField']})
    })
  })

  it('no codec', () => {
    assert.equal(instance.plainField, 1)
    instance.plainField = 2
    assert.equal(instance.plainField, 2)
  })

  it('custom codec', () => {
    const it = instance
    assert.equal(it.codecField, 'doubleme')
    assert.equal(it.getEncoded('codecField'), 'doublemedoubleme')
    it.codecField = 'doub'
    assert.equal(it.codecField, 'doub')
    assert.equal(it.getEncoded('codecField'), 'doubdoub')
  })

  it('ref codec', async function() {
    const it = instance

    const other = new MyModel(client, {plainField: 2, codecField: 'ddd', refField: null})
    assert.equal(await it.refField, null)

    const setField = () => {
      it.refField = other
    }
    // Fails because `other` has no Ref yet.
    assert.throws(setField, InvalidValue)
    await other.save()
    setField()
    assert.equal(it.getEncoded('refField'), other.ref)
    assert.equal(await it.refField, other)

    await it.save()
    it.refField = it

    assert.deepEqual(it.getEncoded('refField'), it.ref)
    assert.equal(await it.refField, it)

    await it.save()
    assert.deepEqual((await (await MyModel.get(client, it.ref)).refField).ref, it.ref)

    // Values of wrong type will not save.
    class MyOtherModel extends Model { }
    MyOtherModel.setup('my_other_models')
    await Class.createForModel(client, MyOtherModel)

    const otherModel = await MyOtherModel.create(client)
    assert.throws(() => { it.refField = otherModel }, InvalidValue)
  })
})
