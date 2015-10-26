import {assert} from 'chai'
import {join} from 'path'
import Client from '../src/client'
import {Ref} from '../src/objects'
import {removeUndefinedValues} from '../src/_util'
const env = process.env

let testConfig
try {
  testConfig = require(join(__dirname, '../testConfig'))
} catch (err) {
  console.log('testConfig.json not found, defaulting to environment variables')
  testConfig = {
    domain: env.FAUNA_DOMAIN,
    scheme: env.FAUNA_SCHEME,
    port: env.FAUNA_PORT,
    auth: parseAuth(env.FAUNA_ROOT_KEY)
  }
}

function parseAuth(authStr) {
  // Split on first ':' to get user:pass
  const parts = authStr.split(':')
  const user = parts.shift()
  const pass = parts.join(':')
  return {user, pass}
}

function takeObjectKeys(object, ...keys) {
  const out = {}
  for (const key of keys)
    out[key] = object[key]
  return out
}

export function getClient(opts) {
  const cfg = removeUndefinedValues(takeObjectKeys(testConfig, 'domain', 'scheme', 'port'))
  return new Client(Object.assign({secret: clientSecret}, cfg, opts))
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

// Set in before hook, so won't be null during tests
export let client = null
export let clientSecret = null

export const rootClient = getClient({secret: testConfig.auth})
const dbName = 'faunadb-js-test'
export const dbRef = new Ref('databases', dbName)

// global before/after for every test

before(async function() {
  try { await rootClient.delete(dbRef) } catch (err) { }
  await rootClient.post('databases', {name: dbName})
  const key = await rootClient.post('keys', {database: dbRef, role: 'server'})
  clientSecret = {user: key.secret}
  client = getClient()
})

after(() => rootClient.delete(dbRef))
