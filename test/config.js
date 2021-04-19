var env = process.env

var testConfig
try {
  testConfig = require('../testConfig.json')
} catch (err) {
  testConfig = {
    domain: env.FAUNA_DOMAIN,
    scheme: env.FAUNA_SCHEME,
    port: env.FAUNA_PORT,
    auth: env.FAUNA_ROOT_KEY,
    auth0uri: env.AUTH_0_URI,
    auth0clientId: env.AUTH_0_CLIENT_ID,
    auth0clientSecret: env.AUTH_0_CLIENT_SECRET,
  }
}

module.exports = testConfig
