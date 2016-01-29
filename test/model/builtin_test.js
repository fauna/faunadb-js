import {assert} from 'chai'
import {assertRejected, client, dbRef, rootClient} from '../util'
import {BadRequest, NotFound} from '../../src/errors'
import {Class, ClassIndex, Database, Index, Key} from '../../src/model/Builtin'
import Model from '../../src/model/Model'
import {Ref} from '../../src/objects'
import * as query from '../../src/query'

let MyModel

describe('Builtin', () => {
  before(async () => {
    MyModel = class MyModel extends Model {}
    MyModel.setup('bananas', {x: {}})
    await Class.createForModel(client, MyModel)
  })

  it('database', async () => {
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
    it('database existence', async () => {
      assert.isFalse(await rootClient.query(
        query.exists(new Ref('databases', 'not_a_real_database_name'))))
    })

  it('key', async () => {
    const database = await Database.get(rootClient, dbRef)
    const key = new Key(rootClient, {database: database.ref, role: 'server'})
    await key.save()
    assert.isFalse(key.isNewInstance())
    assert(key.hashed_secret.length > 0)
  })

  it('custom field', async () => {
    const database = await Database.get(rootClient, dbRef)
    Key.addField('x')
    const key = new Key(rootClient, {database: database.ref, role: 'server', x: 3})
    await key.save()
    assert.equal((await Key.get(rootClient, key.ref)).x, 3)
  })

  it('class', async () => {
    const cls = await Class.getForModel(client, MyModel)
    assert.isFalse(cls.isNewInstance())
    assert(cls.history_days > 0)
    assert.equal(cls.name, MyModel.faunaClassName)

    const permissions = {read: cls.ref}
    cls.permissions = permissions
    await cls.save()

    assert.deepEqual(cls.permissions, permissions)
    assert.deepEqual((await Class.getForModel(client, MyModel)).permissions, permissions)
  })

  it('index', async () => {
    const idx = await Index.createForModel(client, MyModel, 'mooses_by_x', 'x')
    assert.deepEqual(await Index.getById(client, 'mooses_by_x'), idx)
  })

  it('unique index', async () => {
    class F extends Model {}
    F.setup('fs', {x: {}})
    await Class.createForModel(client, F)

    const index = await Index.createForModel(client, F, 'fs_by_x', 'x', {unique: true})
    const instance = await F.create(client, {x: 1})
    // Unique index, so can't create another one.
    assertRejected(() => F.create(client, {x: 1}), BadRequest)

    assert.deepEqual(await index.getSingle(1), instance._current)
    assert.deepEqual(await F.getFromIndex(index, 1), instance)
    assertRejected(() => index.getSingle(2), NotFound)
  })
})
