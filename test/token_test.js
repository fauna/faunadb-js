'use strict';

var assert = require('chai').assert;
var errors = require('../src/errors');
var values = require('../src/values');
var query = require('../src/query');
var util = require('./util');
var Promise = require('es6-promise').Promise;

var Ref = query.Ref;

var client;
var tokenClient;

var rolesClassRef, adminRoleRef, usersClassRef, postsClassRef, userRef

describe('token', function () {
  this.timeout(10000);
  before(function () {
    client = util.client();

    return client.query(query.CreateClass({ name: 'users' })).then(function (instance) {
      usersClassRef = instance.ref;
      return client.query(query.Create(usersClassRef, {data: {name: "Foo"}, credentials: { password: "secret password" }}));
    }).then(function(instance) {
      userRef = instance.ref;
      return client.query(query.CreateClass({ name: 'roles' }));
    }).then(function(instance) {
      rolesClassRef = instance.ref;
      return client.query(query.Create(rolesClassRef, {data: {name: 'Admin'}, delegates: [userRef]}))
    }).then(function(instance) {
      adminRoleRef = instance.ref;
      return client.query(query.CreateClass({ name: 'posts', permissions: {read: adminRoleRef, write: adminRoleRef, create: adminRoleRef}}));
    }).then(function(instance) {
      postsClassRef = instance.ref;
      return client.query(query.Create(query.Ref('tokens'),{ instance: userRef}));
    }).then(function(instance) {
      tokenClient = util.getClient({secret: instance.secret})
    });
  });

  it('create', function () {
    var data = {title: 'Foo'}
    return tokenClient.query(query.Create(postsClassRef, { data: data})).then(function (instance) {
      assert('ref' in instance);
      assert('ts' in instance);
      assert.deepEqual(instance.ref.class, postsClassRef);
      assert.equal(instance.data.title, 'Foo');
    });
  });

  it('should not work to create in a tokens issuing class if no permissions', function (){
    return client.query(query.Create(query.Ref('tokens'),{ instance: adminRoleRef})).then(function(instance) {
      var roleClient = util.getClient({secret: instance.secret});
      assert.throws(function() {
        // Should never get here...
        return roleClient.query(query.Create(rolesClassRef, {data: {name: "Foo"}})).then(function(instance) {
        });
      });
    });
  });

  it('create with custom ref', function () {
    var data = {title: 'Foo'}
    return tokenClient.query(query.Create(Ref(postsClassRef, 1), { data: data})).then(function (instance) {
      // We never get here. Permission denied...
      assert('ref' in instance);
      assert('ts' in instance);
      assert.deepEqual(instance.ref.class, postsClassRef);
      assert.equal(instance.data.title, 'Foo');
    });
  });

  it('insert', function () {
    var data = {title: 'Bar'}
    return tokenClient.query(query.Create(postsClassRef), { data: data}).then(function(instance) {
      var ref = instance.ref;
      var ts = instance.ts;
      var prevTs = ts - 1;

      var inserted = { data: { title: 'Foo' } };

      return tokenClient.query(query.Insert(ref, prevTs, 'create', inserted)).then(function(instance) {
        // We never get here. Permission denied...
        assert('action' in instance);
        assert('ts' in instance);
      });
    });
  });
});
