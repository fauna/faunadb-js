'use strict';

require('es6-promise/auto');
var assert = require('chai').assert;
var query = require('../src/query');
var PageHelper = require('../src/PageHelper');
var util = require('./util');

var client;

var NUM_INSTANCES = 100;

var collectionRef, indexRef, instanceRefs = {}, refsToIndex = {};
var tsCollectionRef, tsIndexRef, tsInstance1Ref, tsInstance1Ts;

describe('page', function() {
  this.timeout(10000);
  before(function() {
    client = util.client();

    var p1 = client.query(query.CreateCollection({ 'name': 'timestamped_things' })).then(function(resp) {
      tsCollectionRef = resp.ref;

      return client.query(query.CreateIndex({
        name: 'timestamped_things_by_collection',
        active: true,
        source: tsCollectionRef
      })).then(function(resp) {
        tsIndexRef = resp.ref;
        return client.query(query.Create(tsCollectionRef));
      }).then(function(resp) {
        tsInstance1Ref = resp.ref;
        tsInstance1Ts = resp.ts;

        return client.query(query.Create(tsCollectionRef));
      });
    });

    var p2 = client.query(query.CreateCollection({ 'name': 'paged_things' })).then(function(resp) {
      collectionRef = resp.ref;
      return client.query(query.CreateIndex({
        name: 'things_by_collection',
        active: true,
        source: collectionRef,
        values: [{ 'field': ['data', 'i'] }, { 'field': 'ref' }]
      })).then(function(resp) {
        indexRef = resp.ref;

        var promises = [];
        for (var i = 0; i < NUM_INSTANCES; ++i) {
          var p = client.query(query.Create(collectionRef, { 'data': { 'i': i } })).then(function(resp) {
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
    var page = new PageHelper(client, query.Match(indexRef));
    return page.map(function(i) { return query.Select([1], i); }).each(function(p) {
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
    return page.filter(function(i) { return query.Equals(query.Modulo([query.Select(0, i), 2]), 0); }).each(function(p) {
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
    return page.eachReverse(function(p) {
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
    var page = new PageHelper(client, query.Match(indexRef), { before: 51 });
    return page.eachReverse(function(p) {
      p.reverse().forEach(function(item) {
        assert.equal(i, refsToIndex[item[1]]);
        i -= 1;
      });
    }).then(function() {
      assert.equal(i, -1);
    });
  });

  it('honors passed in cursor via the cursor option', function() {
    var i = 50;
    var page = new PageHelper(client, query.Match(indexRef), { cursor: { after: 50 } });
    return page.each(function(p) {
      p.forEach(function(item) {
        assert.equal(i, refsToIndex[item[1]]);
        i += 1;
      });
    }).then(function() {
      assert.equal(i, NUM_INSTANCES);
    });
  });

  it('honors passed in cursor in the reverse direction via the cursor option', function() {
    var i = 50;
    var page = new PageHelper(client, query.Match(indexRef), { cursor: { before: 51 } });
    return page.eachReverse(function(p) {
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
    return page.each(function(item) {
      // Note that this relies on numPages being a factor of NUM_INSTANCES
      assert.equal(item.length, pageSize);
      i += 1;
    }).then(function() {
      assert.equal(i, numPages);
    });
  });

  it('honors ts', function() {
    var page = new PageHelper(client, query.Match(tsIndexRef));
    var p1 = page.each(function(item) {
      assert.equal(item.length, 2);
    });

    var page2 = new PageHelper(client, query.Match(tsIndexRef), { ts: tsInstance1Ts });
    var p2 = page2.each(function(item) {
      assert.equal(item.length, 1);
      assert.deepEqual(item[0], tsInstance1Ref);
    });

    return Promise.all([p1, p2]);
  });

  it('honors events', function() {
    var page = new PageHelper(client, query.Match(indexRef), { events: true });
    return page.each(function(p) {
      p.forEach(function(item) {
        assert.property(item, 'ts');
        assert.property(item, 'action');
        assert.property(item, 'document');
        assert.property(item, 'instance');
        assert.property(item, 'data');
      });
    });
  });

  it('honors sources', function() {
    var page = new PageHelper(client, query.Match(indexRef), { sources: true });
    return page.each(function(p) {
      p.forEach(function(item) {
        assert.property(item, 'sources');
      });
    });
  });

  it('honors a combination of parameters', function() {
    var page = new PageHelper(client, query.Match(indexRef), { before: null, events: true, sources: true } );
    return page.each(function(p) {
      p.forEach(function(item) {
        assert.property(item, 'value');
        assert.property(item, 'sources');

        var value = item.value;
        assert.property(value, 'ts');
        assert.property(value, 'action');
        assert.property(value, 'document');
        assert.property(value, 'instance');
        assert.property(value, 'data');
      });
    });
  });

  it('iteratively paginates pages', function() {
    var page = new PageHelper(client, query.Match(indexRef), { size: 2 });

    return page.nextPage().then(function(p) {
      assert.equal(p.length, 2);
      assert.equal(0, refsToIndex[p[0][1]]);
      assert.equal(1, refsToIndex[p[1][1]]);
      return page.nextPage();
    }).then(function(p) {
      assert.equal(p.length, 2);
      assert.equal(2, refsToIndex[p[0][1]]);
      assert.equal(3, refsToIndex[p[1][1]]);
    });
  });

  it('iteratively paginates pages in the reverse direction', function() {
    var page = new PageHelper(client, query.Match(indexRef), { before: null, size: 2 });

    return page.previousPage().then(function(p) {
      assert.equal(p.length, 2);
      assert.equal(98, refsToIndex[p[0][1]]);
      assert.equal(99, refsToIndex[p[1][1]]);
      return page.previousPage();
    }).then(function(p) {
      assert.equal(p.length, 2);
      assert.equal(96, refsToIndex[p[0][1]]);
      assert.equal(97, refsToIndex[p[1][1]]);
    });
  });
});
