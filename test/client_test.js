'use strict';

require('es6-promise/auto');
var assert = require('chai').assert;
var errors = require('../src/errors');
var query = require('../src/query');
var util = require('./util');

var client;

describe('Client', function () {
  before(function () {
    // Hideous way to ensure that the client is initialized.
    client = util.client();

    return client.query(query.CreateCollection({ name: 'my_collection' }));
  });

  it('invalid key', function () {
    var badClient = util.getClient({ secret: { user: 'bad_key' } });
    return util.assertRejected(badClient.query(util.dbRef), errors.Unauthorized);
  });

  it('ping', function () {
    return client.ping('node').then(function(res) {
      assert.equal(res, 'Scope node is OK');
    });
  });

  it('paginates', function() {
    return createDocument().then(function(document) {
      return client.paginate(document.ref).each(function(page) {
        page.forEach(function(i) {
          assert.deepEqual(document.ref, i);
        });
      });
    });
  });

  it('updates the last txntime for a query', function() {
    var firstSeen = client.getLastTxnTime();

    var pEcho = client.query(42).then(function() {
      assert.isAtLeast(client.getLastTxnTime(), firstSeen);
    });

    var pCreate = client.query(query.CreateCollection({ name: 'foo_collection' })).then(function(res) {
      assert.isAbove(client.getLastTxnTime(), firstSeen);
    });

    return Promise.all([pEcho, pCreate]);
  });

  it('manually updates the last txntime for a bigger time', function() {
    var firstSeen = client.getLastTxnTime();

    client.syncLastTxnTime(firstSeen - 1200);
    assert.equal(firstSeen, client.getLastTxnTime());

    var lastSeen = firstSeen + 1200;
    client.syncLastTxnTime(lastSeen);
    assert.equal(lastSeen, client.getLastTxnTime());
  });

  it('extract response headers from observer', function() {
    var assertResults = function(result) {
      assertHeader(result.responseHeaders, 'x-read-ops');
      assertHeader(result.responseHeaders, 'x-write-ops');
      assertHeader(result.responseHeaders, 'x-storage-bytes-read');
      assertHeader(result.responseHeaders, 'x-storage-bytes-write');
      assertHeader(result.responseHeaders, 'x-query-bytes-in');
      assertHeader(result.responseHeaders, 'x-query-bytes-out');

      assert.isAbove(result.endTime, result.startTime);
    };

    var observedClient = util.getClient({ observer: assertResults });

    return observedClient.query(query.CreateCollection({ name: 'bar_collection' }));
  });

  it ('keeps connection alive', function() {
    var aliveClient = util.getClient({ keepAlive: true });
    var p1 = assert.notEqual(aliveClient._keepAliveEnabledAgent, undefined);
    var notAliveClient = util.getClient({ keepAlive: false });
    var p2 = assert.equal(notAliveClient._keepAliveEnabledAgent, undefined);
  
    return Promise.all([p1, p2]);
  });
});

function assertHeader(headers, name) {
  assert.isNotNull(headers[name]);
  assert.isAtLeast(parseInt(headers[name]), 0, 'header["' + name + '"]');
}

function createDocument() {
  return client.query(query.Create(query.Collection('my_collection'), {}));
}
