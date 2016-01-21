import {assert} from 'chai'
import {client} from '../util'
import {InvalidValue} from '../../lib/errors'
import {Ref} from '../../lib/objects'
import {Class} from '../../lib/model/Builtin'
import {RefCodec} from '../../lib/model/Codec'
import Field from '../../lib/model/Field'
import Model from '../../lib/model/Model'

class MyModel extends Model {
  plainField: any
  codecField: string
  refField: Ref
}
let instance: MyModel

describe('Codec', () => {
  before(async () => {
    const DoubleCodec = {
      encode(value: string): string {
        return value + value
      },
      decode(raw: string): string {
        const half = raw.length / 2
        assert.equal(raw.slice(0, half), raw.slice(half))
        return raw.slice(0, half)
      }
    }

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

  it('ref codec', async () => {
    const it = new MyModel(client)
    assert.equal(it.refField, null)

    const ref = new Ref('frogs', '123')
    it.refField = <any> 'frogs/123'
    assert.deepEqual(it.refField, ref)

    it.refField = ref
    assert.equal(it.refField, ref)

    // Fails for any other input
    assert.throws(() => { it.refField = <any> 123 }, InvalidValue)
  })
})
