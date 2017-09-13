'use strict';

var assert = require('chai').assert;
var errors = require('../src/errors');
var query = require('../src/query');
var util = require('./util');

var client;

describe('Client', function () {
  before(function () {
    // Hideous way to ensure that the client is initialized.
    client = util.client();

    return client.query(query.CreateClass({ name: 'my_class' }));
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
    return createInstance().then(function(instance) {
      return client.paginate(instance.ref).each(function(page) {
        page.forEach(function(i) {
          assert.deepEqual(instance.ref, i);
        });
      });
    });
  });
});

function createInstance() {
  return client.query(query.Create(query.Class('my_class'), {}));
}
