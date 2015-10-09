import {assert} from 'chai'
import {client} from '../util'
import {InvalidValue} from '../../src/errors'
import {Ref} from '../../src/objects'
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
      refField: {codec: RefCodec}
    })
    await Class.createForModel(client, MyModel)

    instance = new MyModel(client, {plainField: 1, codecField: 'doubleme'})
  })

  it('model fields', () => {
    class MyModel extends Model {}
    MyModel.setup('my_models', {
      plainField: {},
      refField: {codec: RefCodec}
    })

    assert.deepEqual(MyModel.fields, {
      plainField: new Field({path: ['data', 'plainField']}),
      refField: new Field({codec: RefCodec, path: ['data', 'refField']})
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
    const it = new MyModel(client)
    assert.equal(it.refField, null)

    const ref = new Ref('frogs', 123)
    it.refField = 'frogs/123'
    assert.deepEqual(it.refField, ref)

    it.refField = ref
    assert.equal(it.refField, ref)

    // Fails for any other input
    assert.throws(() => { it.refField = 123 }, InvalidValue)
  })
})
