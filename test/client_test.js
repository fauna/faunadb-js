var assert = require('chai').assert;
var errors = require('../src/errors');
var util = require('./util');

var client = util.client;

var cls;

describe('Client', function () {
  before(function () {
    client.post('classes', {name: 'my_class'}).then(function(result) {
      cls = result;
    });
  });

  it('invalid key', function () {
    var badClient = util.getClient({secret: {user: 'bad_key'}})
    assertRejected(badClient.get(util.dbRef), errors.Unauthorized)
  });

  it('ping', function () {
    client.ping('all').then(function(res) {
      assert.equal(res, 'Scope all is OK');
    });
  });

  it('get', function () {
    client.get('classes').then(function(res) {
      assert.instanceOf(res.data, Array);
    });
  });

  it('post', function () {
    client.get(cls.ref).then(function(res) {
      assert.deepEqual(res, cls);
    });
  });

  it('put', function () {
    createInstance().then(function(instance) {
      return client.put(instance.ref, {data: {a:2}});
    }).then(function(instance) {
      assert.equal(instance.data.a, 2);
      
      return client.put(instance.ref, {data: {b:3}});
    }).then(function(instance) {
      assert.isFalse('a' in instance.data);
      assert.deepEqual(instance.data.b, 3);
    });
  });

  it('patch', function () {
    createInstance().then(function(instance) {
      return client.patch(instance.ref, {data: {a: 1}});
    }).then(function(instance) {
      return client.patch(instance.ref, {data: {b:2}});
    }).then(function(instance) {
      assert.deepEqual(instance.data, {a: 1, b: 2});
    });
  });

  it('delete', function () {
    createInstance().then(function(instance) {
      return client.delete(instance.ref).then(function() { return instance; });
    }).then(function(instance) {
      util.assertRejected(client.get(instance.ref), errors.NotFound);
    });
  });
});

function createInstance() {
  return client.post('classes/my_class', {});
}
