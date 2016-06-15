'use strict';

var chai = require('chai');
var Client = require('../src/Client');
var Expr = require('../src/Expr');
var Value = require('../src/Value');
var query = require('../src/query');
var objectAssign = require('object-assign');
var util = require('../src/_util');

var assert = chai.assert;
var Ref = query.Ref;

var env = process.env;

var testConfig;
try {
  testConfig = require('../testConfig.json');
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
  return new Client(objectAssign({ secret: clientSecret }, cfg, opts));
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

function randomString() {
  return (Math.random() * 0xFFFFFF << 0).toString(16);
}

function unwrapExpr(obj) {
  if (obj instanceof Value) {
    return obj;
  } else if (obj instanceof Expr) {
    return unwrapExprValues(obj.raw);
  } else {
    return obj;
  }
}

function unwrapExprValues(obj) {
  if (Array.isArray(obj)) {
    return obj.map(function(elem) {
      return unwrapExpr(elem);
    });
  } else if (typeof obj === 'object') {
    var rv = {};

    Object.keys(obj).forEach(function (key) {
      rv[key] = unwrapExpr(obj[key]);
    });

    return rv;
  } else {
    return obj;
  }
}

var rootClient = getClient({ secret: testConfig.auth });
var dbName = 'faunadb-js-test-' + randomString();
var dbRef = Ref('databases', dbName);

// global before/after for every test

before(function () {
  return rootClient.query(query.create(Ref('databases'), { name: dbName })).then(function() {
    return rootClient.query(query.create(Ref('keys'), { database: dbRef, role: 'server' }));
  }).then(function(key) {
    clientSecret = { user: key.secret };
    _client = getClient();
  }).catch(function(exception) {
    console.log('failed: ' + exception);
  });
});

after(function () {
  return rootClient.delete(dbRef);
});

module.exports = {
  getClient: getClient,
  assertRejected: assertRejected,
  client: client,
  clientSecret: clientSecret,
  rootClient: rootClient,
  dbRef: dbRef,
  unwrapExpr: unwrapExpr
};
