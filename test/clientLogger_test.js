import {assert} from 'chai'
import {logger} from '../src/clientLogger'
import {client, getClient} from './util'

let classRef

describe('clientLogger', () => {
  before(async () => {
    classRef = (await client.post('classes', {name: 'logging_tests'}))['ref']
  })

  it('logging', async () => {
    const readLine = lineReader(await captureLogged(client => client.ping()))

    assert.equal(readLine(), 'Fauna GET /ping')
    assert.match(readLine(), /^  Credentials:/)
    assert.equal(readLine(), '  Response headers: {')
    // Skip through headers
    while (true) {
      const line = readLine()
      if (!line.startsWith('    ')) {
        assert.equal(line, '  }')
        break
      }
    }
    assert.equal(readLine(), '  Response JSON: {')
    assert.equal(readLine(), '    "resource": "Scope global is OK"')
    assert.equal(readLine(), '  }')
    assert.match(readLine(), /^  Response \(200\): Network latency \d+ms$/)
  })

  it('request content', async () => {
    const readLine = lineReader(await captureLogged(client => client.post(classRef, {data: {}})))

    assert.equal(readLine(), 'Fauna POST /classes/logging_tests')
    assert.match(readLine(), /^  Credentials:/)
    assert.equal(readLine(), '  Request JSON: {')
    assert.equal(readLine(), '    "data": {}')
    assert.equal(readLine(), '  }')
    // Ignore the rest
  })

  it('no auth', async () => {
    const readLine = lineReader(await captureLogged(client => client.ping(), {secret: null}))
    readLine()
    assert.equal(readLine(), '  Credentials: null')
  })

  it('url query', async () => {
    const instance = await client.post(classRef, {data: {}})
    const readLine = lineReader(await captureLogged(client =>
      client.get(instance.ref, {ts: instance.ts})))
    assert.equal(readLine(), `Fauna GET /${instance.ref}?ts=${instance.ts}`)
  })

  it('empty object as url query', async () => {
    const instance = await client.post(classRef, {data: {}})
    const readLine = lineReader(await captureLogged(async client => {
      assert.deepEqual(instance, await client.get(instance.ref, {}))
    }))
    assert.equal(readLine(), `Fauna GET /${instance.ref}`)
  })
})

async function captureLogged(clientAction, clientParams = {}) {
  let logged
  const client = getClient(Object.assign({
    observer: logger(str => {
      logged = str
    })
  }, clientParams))
  await clientAction(client)
  return logged
}

function lineReader(str) {
  const lines = str.split('\n')
  return () => lines.shift()
}

