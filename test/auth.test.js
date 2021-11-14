const fetch = require('cross-fetch')
const query = require('../src/query')
const util = require('./util')
const errors = require('../src/errors')

const headers = {
  'Content-Type': 'application/json',
}

const rateLimitCode = 429
const tooManyEntitiesErrorCode = 'too_many_entities'
const maxAttempts = 10

async function sleepRandom() {
  const max = 10
  const min = 1
  const timeout = Math.floor(Math.random() * (max - min + 1) + min) * 1000
  console.info(`Sleep ${timeout}`)
  await new Promise(resolve => setTimeout(resolve, timeout))
}

async function auth0Request({ endpoint, body, method = 'POST', attempt = 1 }) {
  if (attempt === maxAttempts) {
    return Promise.reject(new Error('Max attempt reached'))
  }
  const response = await fetch(`${util.testConfig.auth0uri}${endpoint}`, {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) }),
  })

  if (response.status === rateLimitCode) {
    console.info('Rate limit', method, endpoint)
    await sleepRandom()
    return auth0Request({ endpoint, body, method, attempt: attempt + 1 })
  }

  if (method !== 'DELETE') {
    const data = await response.json()

    console.info({ endpoint, method, data })

    if (data.errorCode === tooManyEntitiesErrorCode) {
      console.info('Too many entities', endpoint)
      await sleepRandom()
      return auth0Request({ endpoint, body, method })
    }
    return data
  }
}

async function getAuth0Token(params) {
  const data = await auth0Request({
    endpoint: 'oauth/token',
    body: {
      ...params,
      grant_type: 'client_credentials',
    },
  })

  return data.access_token
}

describe('auth', () => {
  describe('AccessProvider Auth0', () => {
    const providerName = util.randomString('js_driver_')
    const roleOneName = util.randomString('role_one_')
    console.info({ providerName })

    let resource
    let authClient
    let grants
    let clientWithAuth0Token

    beforeAll(async () => {
      const adminToken = await getAuth0Token({
        client_id: util.testConfig.auth0clientId,
        client_secret: util.testConfig.auth0clientSecret,
        audience: `${util.testConfig.auth0uri}api/v2/`,
      })
      headers.authorization = `Bearer ${adminToken}`
      await util.client().query(
        query.CreateRole({
          name: roleOneName,
          privileges: [
            {
              resource: query.Roles(),
              actions: { read: true },
            },
          ],
        })
      )
      const provider = await util.client().query(
        query.CreateAccessProvider({
          name: providerName,
          issuer: util.testConfig.auth0uri,
          jwks_uri: `${util.testConfig.auth0uri}.well-known/jwks.json`,
          roles: [query.Role(roleOneName)],
        })
      )

      resource = await auth0Request({
        endpoint: 'api/v2/resource-servers',
        body: {
          name: providerName,
          identifier: provider.audience,
          signing_alg: 'RS256',
        },
      })

      authClient = await auth0Request({
        endpoint: 'api/v2/clients',
        body: {
          name: providerName,
          app_type: 'non_interactive',
          is_first_party: true,
          oidc_conformant: true,
          jwt_configuration: { alg: 'RS256', lifetime_in_seconds: 36000 },
          token_endpoint_auth_method: 'client_secret_post',
          grant_types: ['client_credentials'],
        },
      })

      grants = await auth0Request({
        endpoint: 'api/v2/client-grants',
        body: {
          audience: provider.audience,
          client_id: authClient.client_id,
          scope: [],
        },
      })

      const secret = await getAuth0Token({
        client_id: authClient.client_id,
        client_secret: authClient.client_secret,
        audience: provider.audience,
      })
      clientWithAuth0Token = util.getClient({ secret })
    })

    afterAll(async done => {
      console.info('AFTER ALL')
      // Must run one by one. Otherwise, auth0 returns RateLimit error
      await auth0Request({
        endpoint: `api/v2/resource-servers/${resource.id}`,
        method: 'DELETE',
      })
      await auth0Request({
        endpoint: `api/v2/clients/${authClient.client_id}`,
        method: 'DELETE',
      })
      await auth0Request({
        endpoint: `api/v2/client-grants/${grants.id}`,
        method: 'DELETE',
      })
      done()
      console.info('AFTER ALL DONE')
    })

    test('auth0 setup', () => {
      expect(authClient.error).toBeUndefined()
      expect(resource.error).toBeUndefined()
      expect(grants.error).toBeUndefined()
    })

    test('should have read access for Roles', async () => {
      const res = await clientWithAuth0Token.query(
        query.Get(query.Role(roleOneName))
      )
      expect(res.name).toEqual(roleOneName)
    })

    test("shouldn't have write access for Roles", async () => {
      const res = await clientWithAuth0Token
        .query(query.CreateRole({ name: `permission_deny${roleOneName}` }))
        .catch(err => err)
      expect(res).toBeInstanceOf(errors.PermissionDenied)
    })
  })
})
