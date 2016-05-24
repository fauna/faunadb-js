var chai = require('chai');
var path = require('path');
var Client = require('../src/Client');
var objects = require('../src/objects');
var util = require('../src/_util');

var assert = chai.assert;
var Ref = objects.Ref;

var env = process.env;

var testConfig;
try {
  testConfig = require(path.join(__dirname, '../testConfig'));
} catch (err) {
  console.log('testConfig.json not found, defaulting to environment variables');
  if (typeof env.FAUNA_DOMAIN === 'undefined' ||
      typeof env.FAUNA_SCHEME === 'undefined' ||
      typeof env.FAUNA_PORT === 'undefined' ||
      typeof env.FAUNA_ROOT_KEY === 'undefined') {
    console.log('Environment variables not defined. Please create a config file or set env vars.');
    process.exit();
  }

  testConfig = {
    domain: env.FAUNA_DOMAIN,
    scheme: env.FAUNA_SCHEME,
    port: env.FAUNA_PORT,
    auth: parseAuth(env.FAUNA_ROOT_KEY)
  };
}

function parseAuth(authStr) {
  // Split on first ':' to get user:pass
  var parts = authStr.split(':');
  var user = parts.shift();
  var pass = parts.join(':');
  return { user: user, pass: pass };
}

function takeObjectKeys(object) {
  var out = {};
  for (var key in arguments) {
    out[key] = object[key];
  }
  return out;
}

function getClient(opts) {
  var cfg = util.removeUndefinedValues(takeObjectKeys(testConfig, 'domain', 'scheme', 'port'));
  return new Client(Object.assign({ secret: clientSecret }, cfg, opts));
}

function assertRejected(promise, errorType) {
  var succeeded = false;
  
  return promise.then(function() {
    succeeded = true;
    assert(!succeeded, 'Expected promise to fail.');
  }, function(error) {
    if (!(error instanceof errorType)) {
      throw error;
    }
  });
}

// Set in before hook, so won't be null during tests
var client = null;
var clientSecret = null;

var rootClient = getClient({ secret: testConfig.auth });
var dbName = 'faunadb-js-test';
var dbRef = new Ref('databases', dbName);

// global before/after for every test

before(function () {
  return rootClient.delete(dbRef).then(function() {
    return rootClient.post('databases', { name: dbName });
  }).then(function() {
    return rootClient.post('keys', { database: dbRef, role: 'server' });
  }).then(function(key) {
    clientSecret = { user: key.secret };
    client = getClient();
  }).catch(function(exception) {
    console.log("failed: "+exception);
  });
});

after(function () {
  rootClient.delete(dbRef);
});

module.exports = {
  getClient: getClient,
  assertRejected: assertRejected,
  client: client,
  clientSecret: clientSecret,
  rootClient: rootClient,
  dbRef: dbRef
};
