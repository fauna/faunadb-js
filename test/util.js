import {assert} from 'chai'
import Client from '../src/client'
import {Ref} from '../src/objects'
const env = process.env

let testConfig
try {
  testConfig = require('../testConfig')
} catch (err) {
  console.log('testConfig.json not found, defaulting to environment variables')
  testConfig = {
    domain: env.FAUNA_DOMAIN,
    scheme: env.FAUNA_SCHEME,
    port: env.FAUNA_PORT,
    rootKey: env.FAUNA_ROOT_KEY
  }
}

export const getClient = opts => {
  const defaultOpts = {
    domain: testConfig.domain,
    scheme: testConfig.scheme,
    port: testConfig.port,
    secret: clientSecret
  }
  return new Client(Object.assign(defaultOpts, opts))
}

export async function assertRejected(promise, errorType) {
  let succeeded = false
  try {
    await promise
    succeeded = true
  } catch (error) {
    assert(error instanceof errorType)
  }
  if (succeeded)
    assert.fail('Expected promise to fail')
}

const rootClient = getClient({secret: {user: testConfig.rootKey}})
const dbName = 'faunadb-js-test'
export const dbRef = new Ref('databases', dbName)

// set in before hook, so won't be null during tests
export let client = null
export let clientSecret = null

// global before/after for every test

before(async function() {
  try { await rootClient.delete(dbRef) } catch (err) { }
  await rootClient.post('databases', {name: dbName})
  const key = await rootClient.post('keys', {database: dbRef, role: 'server'})
  clientSecret = {user: key.secret}
  client = getClient()
})

after(() => rootClient.delete(dbRef))
