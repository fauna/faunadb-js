'use strict';

var chai = require('chai');
var path = require('path');
var Client = require('../src/Client');
var objects = require('../src/objects');
var util = require('../src/_util');
var errors = require('../src/errors');
var query = require('../src/query');

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
  for (var i = 0; i < arguments.length; ++i) {
    var key = arguments[i];
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
var _client = null;
var clientSecret = null;

function client() {
  return _client;
}

var rootClient = getClient({ secret: testConfig.auth });
var dbName = 'faunadb-js-test';
var dbRef = new Ref('databases', dbName);

// global before/after for every test

before(function () {
  return rootClient.query(query.delete_expr(dbRef)).catch(function(exception) {
    if (exception instanceof errors.BadRequest) {
      return;
    } else {
      throw exception;
    }
  }).then(function() {
    return rootClient.query(query.create(new objects.Ref('databases'), query.object({ name: dbName })));
  }).then(function() {
    return rootClient.query(query.create(new objects.Ref('keys'), query.quote({ database: dbRef, role: 'server' })));
  }).then(function(key) {
    clientSecret = { user: key.secret };
    _client = getClient();
  }).catch(function(exception) {
    console.log('failed: ' + exception);
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
