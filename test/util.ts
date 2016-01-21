import {assert} from 'chai'
import {join} from 'path'
import {env} from 'process'
import Client, {Auth} from '../lib/Client'
import {Ref} from '../lib/objects'
import {removeUndefinedValues} from '../lib/_util'

let testConfig: {domain: string, scheme: string, port: number, auth: Auth}
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

function parseAuth(authStr: string): Auth {
  // Split on first ':' to get user:pass
  const parts = authStr.split(':')
  const user = parts.shift()
  const pass = parts.join(':')
  return {user, pass}
}

function takeObjectKeys(object: any, ...keys: Array<string>): any {
  const out: any = {}
  for (const key of keys)
    out[key] = object[key]
  return out
}

export function getClient(opts: {secret?: Auth} = {}): Client {
  const cfg = removeUndefinedValues(takeObjectKeys(testConfig, 'domain', 'scheme', 'port'))
  return new Client(Object.assign({secret: clientSecret}, cfg, opts))
}

export async function assertRejected(promise: Promise<any>, errorType: any): Promise<void> {
  let succeeded = false
  try {
    await promise
    succeeded = true
  } catch (error) {
    if (!(error instanceof errorType))
      throw error
  }
  assert(!succeeded, 'Expected promise to fail.')
}

// Set in before hook, so won't be null during tests
export let client: Client = null
export let clientSecret: Auth = null

export const rootClient = getClient({secret: testConfig.auth})
const dbName = 'faunadb-js-test'
export const dbRef = new Ref('databases', dbName)

// global before/after for every test

before(async () => {
  try { await rootClient.delete(dbRef) } catch (err) { }
  await rootClient.post('databases', {name: dbName})
  const key = await rootClient.post('keys', {database: dbRef, role: 'server'})
  clientSecret = {user: key.secret}
  client = getClient()
})

after(() => rootClient.delete(dbRef))
