'use strict';

var assert = require('chai').assert;
var logger = require('../src/clientLogger').logger;
var query = require('../src/query');
var objectAssign = require('object-assign');
var util = require('./util');

var client;
var collectionRef;

// Polyfill for startsWith, which IE11 does not support
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

describe('clientLogger', function () {
  before(function () {
    // Hideous way to ensure the client is initialized.
    client = util.client();
    return client.query(query.CreateCollection({ name: 'logging_tests' })).then(function (res) {
      collectionRef = res['ref'];
    });
  });

  it('logging', function () {
    return captureLogged(function (loggingClient) {
      return loggingClient.ping();
    }).then(function (res) {
      var readLine = lineReader(res);
      assert.equal(readLine(), 'Fauna GET /ping');
      assert.equal(readLine(), '  Response headers: {');

      // Skip through headers
      while (true) {
        var line = readLine();
        if (!line.startsWith('    ')) {
          assert.equal(line, '  }');
          break;
        }
      }

      assert.equal(readLine(), '  Response JSON: {');
      assert.equal(readLine(), '    "resource": "Scope write is OK"');
      assert.equal(readLine(), '  }');
      assert.match(readLine(), /^  Response \(200\): Network latency \d+ms$/);
    });
  });

  it('request content', function () {
    return captureLogged(function (client) {
      return client.query(query.Create(collectionRef, { data: {} }));
    }).then(function (res) {
      var readLine = lineReader(res);
      assert.equal(readLine(), 'Fauna POST /');
      assert.equal(readLine(), '  Request JSON: {');
      assert.equal(readLine(), '    "create": {');
      assert.equal(readLine(), '      "@ref": {');
      assert.equal(readLine(), '        "id": "logging_tests",');
      assert.equal(readLine(), '        "collection": {');
      assert.equal(readLine(), '          "@ref": {');
      assert.equal(readLine(), '            "id": "collections"');
      assert.equal(readLine(), '          }');
      assert.equal(readLine(), '        }');
      assert.equal(readLine(), '      }');
      assert.equal(readLine(), '    },');
      assert.equal(readLine(), '    "params": {');
      assert.equal(readLine(), '      "object": {');
      assert.equal(readLine(), '        "data": {');
      assert.equal(readLine(), '          "object": {}');
      assert.equal(readLine(), '        }');
      assert.equal(readLine(), '      }');
      assert.equal(readLine(), '    }');
      assert.equal(readLine(), '  }');
      // Ignore the rest
    });
  });
});

function captureLogged(clientAction, clientParams) {
  if (typeof clientParams === 'undefined') {
    clientParams = {};
  }

  var logged;
  var loggedClient = util.getClient(objectAssign({
    observer: logger(function (str) {
      logged = str;
    })
  }, clientParams));

  return clientAction(loggedClient).then(function () { return logged; });
}

function lineReader(str) {
  var lines = str.split('\n');
  return function () { return lines.shift(); };
}
