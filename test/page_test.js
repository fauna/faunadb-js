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
var tsClassRef, tsIndexRef, tsInstance1Ref, tsInstance1Ts, tsInstance2Ref, tsInstance2Ts;

describe('page', function() {
  before(function() {
    client = util.client();

    var p1 = client.query(query.create(new Ref('classes'), { "name": "timestamped_things"} )).then(function(resp) {
      tsClassRef = resp.ref;

      return client.query(query.create(new Ref('indexes'), {
        name: 'timestamped_things_by_class',
        source: tsClassRef
      })).then(function(resp) {
        tsIndexRef = resp.ref;
        return client.query(query.create(tsClassRef));
      }).then(function(resp) {
        tsInstance1Ref = resp.ref;
        tsInstance1Ts = resp.ts;

        return client.query(query.create(tsClassRef));
      }).then(function(resp) {
        tsInstance2Ref = resp.ref;
        tsInstance2Ts = resp.ts;
      });
    });

    var p2 = client.query(query.create(new Ref('classes'), {"name": "paged_things"} )).then(function(resp) {
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

    return Promise.all([p1, p2]);
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

  it('honors size', function() {
    var i = 0;
    var numPages = 20;
    var pageSize = NUM_INSTANCES / numPages;

    var page = new Page(client, query.match(indexRef), { size: pageSize });
    return page.each(function(item) {
      // Note that this relies on numPages being a factor of NUM_INSTANCES
      assert.equal(item.length, pageSize);
      i += 1;
    }).then(function() {
      assert.equal(i, numPages);
    });
  });

  it('honors ts', function() {
    var page = new Page(client, query.match(tsIndexRef));
    var p1 = page.each(function(item) {
      assert.equal(item.length, 2);
    });

    var page2 = new Page(client, query.match(tsIndexRef), { ts: tsInstance1Ts });
    var p2 = page2.each(function(item) {
      assert.equal(item.length, 1);
      assert.deepEqual(item[0], tsInstance1Ref);
    });

    return Promise.all([p1, p2]);
  });

  it('honors events', function() {
    var page = new Page(client, query.match(indexRef), { events: true });
    return page.each(function(p) {
      p.forEach(function(item) {
        assert.property(item, 'ts');
        assert.property(item, 'action');
        assert.property(item, 'resource');
        assert.property(item, 'values');
      });
    });
  })

  it('honors sources', function() {
    var page = new Page(client, query.match(indexRef), { sources: true });
    return page.each(function(p) {
      p.forEach(function(item) {
        assert.property(item, 'sources');
      });
    });
  });
});