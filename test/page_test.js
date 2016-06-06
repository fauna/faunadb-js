'use strict';

var assert = require('chai').assert;
var query = require('../src/query');
var objects = require('../src/objects');
var Page = require('../src/Page');
var Promise = require('es6-promise').Promise;
var util = require('./util');

var Ref = objects.Ref;

var client;

const NUM_INSTANCES = 100;

var classRef, indexRef, instanceRefs = {}, refsToIndex = {};

describe('page', function() {
  before(function() {
    client = util.client();
    
    return client.query(query.create(new Ref('classes'), {"name": "paged_things"} )).then(function(resp) {
      classRef = resp.ref;
      return client.query(query.create(new Ref('indexes'), {
        name: 'things_by_class',
        source: classRef,
        values: [ {"field": [ "data", "i" ]},  { "field": "ref" }]
      })).then(function(resp) {
        indexRef = resp.ref;

        var promises = [];
        for(var i = 0; i < NUM_INSTANCES; ++i) {
          var p = client.query(query.create(classRef, { "data": { "i": i }})).then(function(resp) {
            instanceRefs[resp.data.i] = resp.ref;
            refsToIndex[resp.ref] = resp.data.i;
          });
          promises.push(p);
        }

        return Promise.all(promises);
      });
    });
  });

  it('pages', function() {
    var page = new Page(client, query.match(indexRef));
    return page.each(function(p) {
      p.forEach(function(item) {
        var i = item[0];
        var ref = item[1];
        assert.deepEqual(ref, instanceRefs[i]);
      });
    });
  });

  it('maps pagination', function() {
    var i = 0;
    var page = new Page(client, query.match(indexRef));
    return page.map(function(i) { return query.select([1], i); }).each(function(p) {
      p.forEach(function(item) {
        assert.equal(i, refsToIndex[item]);
        i += 1;
      });
    }).then(function() {
      assert.equal(i, NUM_INSTANCES);
    });
  });

  it('filters pagination', function() {
    var i = 0;
    var page = new Page(client, query.match(indexRef));
    return page.filter(function(i) { return query.equals(query.modulo([query.select(0, i), 2]), 0) }).each(function(p) {
      p.forEach(function(item) {
        assert.equal(i, refsToIndex[item[1]]);
        i += 2;
      });
    }).then(function() {
      assert.equal(i, NUM_INSTANCES);
    });
  });

  it('reverses pagination', function() {
    var i = NUM_INSTANCES - 1;
    var page = new Page(client, query.match(indexRef), { before: null });
    return page.each(function(p) {
      p.reverse().forEach(function(item) {
        assert.equal(i, refsToIndex[item[1]]);
        i -= 1;
      });
    }).then(function() {
      assert.equal(i, -1); // ensure we made it to the end of the set
    });
  });

  it('honors passed in cursor', function() {
    var i = 50;
    var page = new Page(client, query.match(indexRef), { after: 50 });
    return page.each(function(p) {
      p.forEach(function(item) {
        assert.equal(i, refsToIndex[item[1]]);
        i += 1;
      });
    }).then(function() {
      assert.equal(i, NUM_INSTANCES);
    });
  });

  it('honors passed in cursor in the reverse direction', function() {
    var i = 50;
    var page = new Page(client, query.match(indexRef), { before: 51 });
    return page.each(function(p) {
      p.reverse().forEach(function(item) {
        assert.equal(i, refsToIndex[item[1]]);
        i -= 1;
      });
    }).then(function() {
      assert.equal(i, -1);
    })
  });
});