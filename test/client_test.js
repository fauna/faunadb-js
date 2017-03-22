'use strict';

var assert = require('chai').assert;
var errors = require('../src/errors');
var util = require('./util');

var client;
var cls;

describe('Client', function () {
  before(function () {
    // Hideous way to ensure that the client is initialized.
    client = util.client();

    return client.post('classes', { name: 'my_class' }).then(function(result) {
      cls = result;
    });
  });

  it('invalid key', function () {
    var badClient = util.getClient({ secret: { user: 'bad_key' } });
    return util.assertRejected(badClient.get(util.dbRef), errors.Unauthorized);
  });

  it('ping', function () {
    return client.ping('node').then(function(res) {
      assert.equal(res, 'Scope node is OK');
    });
  });

  it('get', function () {
    return client.get('classes').then(function(res) {
      assert.instanceOf(res.data, Array);
    });
  });

  it('post', function () {
    return client.get(cls.ref).then(function(res) {
      assert.deepEqual(res, cls);
    });
  });

  it('put', function () {
    return createInstance().then(function(instance) {
      return client.put(instance.ref, { data: { a:2 } });
    }).then(function(instance) {
      assert.equal(instance.data.a, 2);

      return client.put(instance.ref, { data: { b:3 } });
    }).then(function(instance) {
      assert.isFalse('a' in instance.data);
      assert.deepEqual(instance.data.b, 3);
    });
  });

  it('patch', function () {
    return createInstance().then(function(instance) {
      return client.patch(instance.ref, { data: { a: 1 } });
    }).then(function(instance) {
      return client.patch(instance.ref, { data: { b:2 } });
    }).then(function(instance) {
      assert.deepEqual(instance.data, { a: 1, b: 2 });
    });
  });

  it('delete', function () {
    return createInstance().then(function(instance) {
      return client.delete(instance.ref).then(function() { return instance; });
    }).then(function(instance) {
      util.assertRejected(client.get(instance.ref), errors.NotFound);
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
  return client.post('classes/my_class', {});
}
