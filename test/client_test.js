import {assert} from 'chai'
import Stream from 'stream'
import {Logger, transports} from 'winston'
import {NotFound, Unauthorized} from '../src/errors'
import {assertRejected, client, clientSecret, dbRef, getClient} from './util'

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
    const tests = {
      global: 'Scope Global is OK',
      local: 'Scope Local is OK',
      node: 'Scope Node is OK',
      all: 'Scope All is OK'
    }
    assert.equal(await client.ping(), 'Scope Global is OK')
    for (const key in tests)
      assert.equal(await client.ping(key), tests[key])
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

  it('logger', async function() {
    const logs = await captureLogs(client => client.ping())
    assert.equal(logs[0], 'Fauna GET /ping')
    assert.equal(logs[1], `  Credentials: {"user":"${clientSecret.user}"}`)
    assert(logs[2].startsWith('  Response headers: {'))
    assert.equal(logs[3], `  Response JSON: {
    "resource": "Scope Global is OK"
  }`)
    assert.match(logs[4], /^  Response \(200\): API processing \d+ms, network latency \d+ms$/)
    assert.equal(logs.length, 5)
  })

  it('logger_no_auth', async function() {
    const logs = await captureLogs(client => client.ping(), {secret: null})
    assert.equal(logs[1], '  Credentials: null')
  })
})

const createInstance = () => client.post('classes/my_class', {})

async function captureLogs(doWithClient, clientOpts={}) {
  const stream = new TestStream()
  const logger = new Logger({transports: [new transports.File({stream})]})
  const client = getClient(Object.assign({logger}, clientOpts))
  await doWithClient(client)
  return stream.end()
}

class TestStream extends Stream {
  constructor() {
    super()
    this.chunks = []
  }

  write(chunk) {
    this.chunks.push(chunk)
  }

  end() {
    return this.chunks.map(str => JSON.parse(str).message)
  }
}
