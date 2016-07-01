'use strict';

var assert = require('chai').assert;
var query = require('../src/query');
var values = require('../src/values');
var PageHelper = require('../src/PageHelper');
var Promise = require('es6-promise').Promise;
var util = require('./util');

var client;

var Ref = query.Ref;

var NUM_INSTANCES = 100;

var classRef, indexRef, instanceRefs = {}, refsToIndex = {};
var tsClassRef, tsIndexRef, tsInstance1Ref, tsInstance1Ts;

describe('page', function() {
  this.timeout(5000);
  before(function() {
    client = util.client();

    var p1 = client.query(query.Create(Ref('classes'), { 'name': 'timestamped_things' } )).then(function(resp) {
      tsClassRef = resp.ref;

      return client.query(query.Create(Ref('indexes'), {
        name: 'timestamped_things_by_class',
        source: tsClassRef
      })).then(function(resp) {
        tsIndexRef = resp.ref;
        return client.query(query.Create(tsClassRef));
      }).then(function(resp) {
        tsInstance1Ref = resp.ref;
        tsInstance1Ts = resp.ts;

        return client.query(query.Create(tsClassRef));
      });
    });

    var p2 = client.query(query.Create(Ref('classes'), { 'name': 'paged_things' } )).then(function(resp) {
      classRef = resp.ref;
      return client.query(query.Create(Ref('indexes'), {
        name: 'things_by_class',
        source: classRef,
        values: [{ 'field': [ 'data', 'i' ] }, { 'field': 'ref' }]
      })).then(function(resp) {
        indexRef = resp.ref;

        var promises = [];
        for(var i = 0; i < NUM_INSTANCES; ++i) {
          var p = client.query(query.Create(classRef, { 'data': { 'i': i } })).then(function(resp) {
            instanceRefs[resp.data.i] = resp.ref;
            refsToIndex[resp.ref] = resp.data.i;
          });
          promises.push(p);
        }

        return Promise.all(promises);
      });
    });

    return Promise.all([p1, p2]);
  });

  it('pages', function() {
    var page = new PageHelper(client, query.Match(indexRef));
    return page.eachPage(function(p) {
      p.forEach(function(item) {
        var i = item[0];
        var ref = item[1];
        assert.deepEqual(ref, instanceRefs[i]);
      });
    });
  });

  it('maps pagination', function() {
    var i = 0;
    var page = new PageHelper(client, query.Match(indexRef));
    return page.map(function(i) { return query.Select([1], i); }).eachPage(function(p) {
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
    var page = new PageHelper(client, query.Match(indexRef));
    return page.filter(function(i) { return query.Equals(query.Modulo([query.Select(0, i), 2]), 0); }).eachPage(function(p) {
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
    var page = new PageHelper(client, query.Match(indexRef), { before: null });
    return page.eachPage(function(p) {
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
    var page = new PageHelper(client, query.Match(indexRef), { after: 50 });
    return page.eachPage(function(p) {
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
    var page = new PageHelper(client, query.Match(indexRef), { before: 51 });
    return page.eachPage(function(p) {
      p.reverse().forEach(function(item) {
        assert.equal(i, refsToIndex[item[1]]);
        i -= 1;
      });
    }).then(function() {
      assert.equal(i, -1);
    });
  });

  it('honors size', function() {
    var i = 0;
    var numPages = 20;
    var pageSize = NUM_INSTANCES / numPages;

    var page = new PageHelper(client, query.Match(indexRef), { size: pageSize });
    return page.eachPage(function(item) {
      // Note that this relies on numPages being a factor of NUM_INSTANCES
      assert.equal(item.length, pageSize);
      i += 1;
    }).then(function() {
      assert.equal(i, numPages);
    });
  });

  it('honors ts', function() {
    var page = new PageHelper(client, query.Match(tsIndexRef));
    var p1 = page.eachPage(function(item) {
      assert.equal(item.length, 2);
    });

    var page2 = new PageHelper(client, query.Match(tsIndexRef), { ts: tsInstance1Ts });
    var p2 = page2.eachPage(function(item) {
      assert.equal(item.length, 1);
      assert.deepEqual(item[0], tsInstance1Ref);
    });

    return Promise.all([p1, p2]);
  });

  it('honors events', function() {
    var page = new PageHelper(client, query.Match(indexRef), { events: true });
    return page.eachPage(function(p) {
      p.forEach(function(item) {
        assert.property(item, 'ts');
        assert.property(item, 'action');
        assert.property(item, 'resource');
        assert.property(item, 'values');
      });
    });
  });

  it('honors sources', function() {
    var page = new PageHelper(client, query.Match(indexRef), { sources: true });
    return page.eachPage(function(p) {
      p.forEach(function(item) {
        assert.property(item, 'sources');
      });
    });
  });

  it('honors a combination of parameters', function() {
    var page = new PageHelper(client, query.Match(indexRef), { before: null, events: true, sources: true } );
    return page.eachPage(function(p) {
      p.forEach(function(item) {
        assert.property(item, 'value');
        assert.property(item, 'sources');

        var value = item.value;
        assert.property(value, 'ts');
        assert.property(value, 'action');
        assert.property(value, 'resource');
        assert.property(value, 'values');
      });
    });
  });

  it('paginates eachPage item', function() {
    var i = 0;
    var page = new PageHelper(client, query.Match(indexRef));
    return page.eachItem(function(item) {
      assert.equal(i, refsToIndex[item[1]]);
      i += 1;
    });
  });
});