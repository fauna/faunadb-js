import {assert} from 'chai'
import {NotFound, Unauthorized} from '../src/errors'
import {assertRejected, client, dbRef, getClient} from './util'

let cls

describe('Client', () => {
  before(async function() {
    cls = await client.post('classes', {name: 'my_class'})
  })

  it('invalid key', async function() {
    const client = getClient({secret: {user: 'bad_key'}})
    await assertRejected(client.get(dbRef), Unauthorized)
  })

  it('ping', async function() {
    assert.equal(await client.ping('all'), 'Scope all is OK')
  })

  it('get', async function() {
    const classes = await client.get('classes')
    assert.instanceOf(classes.data, Array)
  })

  it('post', async function() {
    assert.deepEqual(await client.get(cls.ref), cls)
  })

  it('put', async function() {
    let instance = await createInstance()

    instance = await client.put(instance.ref, {data: {a: 2}})
    assert.equal(instance.data.a, 2)

    instance = await client.put(instance.ref, {data: {b: 3}})
    assert.isFalse('a' in instance.data)
    assert.deepEqual(instance.data.b, 3)
  })

  it('patch', async function() {
    let instance = await createInstance()
    instance = await client.patch(instance.ref, {data: {a: 1}})
    instance = await client.patch(instance.ref, {data: {b: 2}})
    assert.deepEqual(instance.data, {a: 1, b: 2})
  })

  it('delete', async function() {
    const instance = await createInstance()
    await client.delete(instance.ref)
    await assertRejected(client.get(instance.ref), NotFound)
  })
})

const createInstance = () => client.post('classes/my_class', {})
