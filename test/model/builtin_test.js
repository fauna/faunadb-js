import {assert} from 'chai'
import {assertRejected, client, dbRef, rootClient} from '../util'
import {NotFound} from '../../src/errors'
import {Class, ClassIndex, Database, Index, Key} from '../../src/model/Builtin'
import Model from '../../src/model/Model'
import {Ref} from '../../src/objects'
import * as query from '../../src/query'

let MyModel

describe('Builtin', () => {
  before(async function() {
    MyModel = class MyModel extends Model {}
    MyModel.setup('bananas', {x: {}})
    await Class.createForModel(client, MyModel)
  })

  it('database', async function() {
    const name = 'builtin_test_database'
    const db = new Database(rootClient, {name, api_version:'2.0'})
    assert.equal(db.name, name)
    assert.equal(db.api_version, '2.0')

    await db.save()
    assert.isFalse(db.isNewInstance())
    const ref = db.ref
    assert.deepEqual(ref, new Ref('databases', name))

    await db.delete()

    // TODO: see test 'database existence'.
    assertRejected(() => rootClient.get(ref), NotFound)
  })

  // See core issue #1975.
  if (false)
    it('database existence', async function() {
      assert.isFalse(await rootClient.query(
        query.exists(new Ref('databases', 'not_a_real_database_name'))))
    })

  it('key', async function() {
    const database = await Database.get(rootClient, dbRef)
    const key = new Key(rootClient, {database, role: 'server'})
    await key.save()
    assert.isFalse(key.isNewInstance())
    assert(key.hashed_secret.length > 0)
  })

  it('custom field', async function() {
    const database = await Database.get(rootClient, dbRef)
    Key.addField('x')
    const key = new Key(rootClient, {database, role: 'server', x: 3})
    await key.save()
    assert.equal((await Key.get(rootClient, key.ref)).x, 3)
  })

  it('class', async function() {
    const cls = await Class.getForModel(client, MyModel)
    assert.isFalse(cls.isNewInstance())
    assert(cls.history_days > 0)
    assert.equal(cls.name, MyModel.faunaClassName)

    cls.permissions = 'public'
    await cls.save()

    assert.equal(cls.permissions, 'public')
    assert.equal((await Class.getForModel(client, MyModel)).permissions, 'public')
  })

  it('index', async function() {
    const idx = await Index.createForModel(client, MyModel, 'mooses_by_x', 'x')
    assert.deepEqual(await Index.getById(client, 'mooses_by_x'), idx)

    const instance1 = await MyModel.create(client, {x: 1})
    await MyModel.create(client, {x: 2})
    const instance2 = await MyModel.create(client, {x: 1})

    assert.deepEqual((await MyModel.pageIndex(idx, 1)).data, [instance1, instance2])

    const all = await MyModel.pageIteratorForIndex(idx, 1).all()
    assert.deepEqual(all, [instance1, instance2])
  })

  it('terms and values', async function() {
    class D extends Model {}
    D.setup('ds', {x: {}, y: {}})
    await Class.createForModel(client, D)

    const idx = await Index.createForModel(
      client,
      D,
      'ds_by_x_y',
      [{path: 'data.x'}, {path: 'data.y'}])

    const d11 = await D.create(client, {x: 1, y: 1})
    await D.create(client, {x: 1, y: 2})
    await D.create(client, {x: 2, y: 1})

    assert.deepEqual((await D.pageIndex(idx, [1, 1])).data, [d11])
  })

  it('class index', async function() {
    class M extends Model {}
    M.setup('test_list_model', {number: {}})
    await Class.createForModel(client, M)

    const idx = await ClassIndex.createForModel(client, M)
    assert.deepEqual(await ClassIndex.getForModel(client, M), idx)

    const ms = []
    for (let i = 0; i < 10; i = i + 1)
      ms.push(await M.create(client, {number: i}))

    const ms_set = idx.match()
    const page = await M.page(client, ms_set, {size: 2})
    assert.deepEqual(page.data, [ms[0], ms[1]])
    const page2 = await M.page(client, ms_set, {size: 2, after: page.after})
    assert.deepEqual(page2.data, [ms[2], ms[3]])

    // List of all Ms should be exactly 100 in length
    const all = await M.pageIteratorForIndex(idx, 1).all()
    assert.deepEqual(all, ms)
  })
})
