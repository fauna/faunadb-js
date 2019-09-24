'use strict';

var assert = require('chai').assert;
var errors = require('../src/errors');
var values = require('../src/values');
var query = require('../src/query');
var util = require('./util');
var Promise = require('es6-promise').Promise;

var Ref = query.Ref;

var FaunaDate = values.FaunaDate,
  FaunaTime = values.FaunaTime,
  SetRef = values.SetRef,
  Bytes = values.Bytes,
  Native = values.Native;

var client;

var collectionRef, nIndexRef, mIndexRef, nCoveredIndexRef, refN1, refM1, refN1M1, thimbleCollectionRef;

describe('query', function () {
  this.timeout(10000);
  before(function () {
    // Hideous way to ensure that the client is initialized.
    client = util.client();

    return client.query(query.CreateCollection({ name: 'widgets' })).then(function (document) {
      collectionRef = document.ref;
      var nIndexRefP = client.query(query.CreateIndex({
        name: 'widgets_by_n',
        active: true,
        source: collectionRef,
        terms: [ { 'field': ['data', 'n'] }]
      })).then(function(i) { nIndexRef = i.ref; });

      var mIndexRefP = client.query(query.CreateIndex({
        name: 'widgets_by_m',
        active: true,
        source: collectionRef,
        terms: [ { 'field': ['data', 'm'] }]
      })).then(function(i) { mIndexRef = i.ref; });

      var nCoveredIndexRefP = client.query(query.CreateIndex({
        name: 'widgets_cost_by_p',
        active: true,
        source: collectionRef,
        terms: [ { 'field': ['data', 'p' ] }],
        values: [ { 'field': ['data', 'cost' ] }]
      })).then(function(i) { nCoveredIndexRef = i.ref; });

      return Promise.all([nIndexRefP, mIndexRefP, nCoveredIndexRefP]).then(function() {
        var createP = create({ n: 1, p: 1, cost: 10 }).then(function (i) {
          refN1 = i.ref;
          return create({ m: 1, p: 1, cost: 15 });
        }).then(function (i) {
          refM1 = i.ref;
          return create({ n: 1, m: 1, p: 1, cost: 10 });
        }).then(function (i) { refN1M1 = i.ref; });
        var thimbleCollectionRefP = client.query(query.CreateCollection({ name: 'thimbles' })).then(function (i) { thimbleCollectionRef = i.ref; });

        return Promise.all([createP, thimbleCollectionRefP]);
      });
    });
  });

  it('echo values', function () {
    var pInteger = client.query(10).then(function (res) {
      assert.equal(res, 10);
    });

    var pNumber = client.query(3.14).then(function (res) {
      assert.equal(res, 3.14);
    });

    var pString = client.query('string').then(function (res) {
      assert.equal(res, 'string');
    });

    var pObject = client.query({ a: 1, b: 'string', c: 3.14, d: null }).then(function (res) {
      assert.deepEqual(res, { a: 1, b: 'string', c: 3.14, d: null });
    });

    var pArray = client.query([1, 'string', 3.14, null]).then(function (res) {
      assert.deepEqual(res, [1, 'string', 3.14, null]);
    });

    var pNull = client.query(null).then(function (res) {
      assert.equal(res, null);
    });

    var pSymbol = client.query(Symbol('foo')).then(function (res) {
      assert.equal(res, 'foo');
    });

    return Promise.all([pInteger, pNumber, pString, pObject, pArray, pNull, pSymbol]);
  });

  // Basic forms

  it('abort', function () {
    return util.assertRejected(
      client.query(query.Abort('abort message')),
      errors.BadRequest
    );
  });

  it('at', function () {
    var client = util.client();

    var paginate = query.Paginate(nSet(1000));

    return create({ n: 1000 }).then(function (inst1) {
      return create({ n: 1000 }).then(function (inst2) {
        return create({ n: 1000 }).then(function (inst3) {
          var p1 = client.query(paginate).then(function (data) {
            assert.deepEqual(data.data, [inst1.ref, inst2.ref, inst3.ref], 'Should contains all document with n=1000');
          });

          var p2 = client.query(query.At(inst1.ts, paginate)).then(function (data) {
            assert.deepEqual(data.data, [inst1.ref], 'Should contains only the first document with n=1000');
          });

          return Promise.all([p1, p2]);
        });
      });
    });
  });

  it('let/var', function () {
    return Promise.all([
      assertQuery(query.Let({ x: 1 }, query.Var('x')), 1),
      assertQuery(query.Let({ x: 1, y: 2 }, function(x, y) { return [x, y]; }), [1, 2]),
      assertQuery(query.Let([{ x: 1 }, { y: 2 }], function(x, y) { return [x, y]; }), [1, 2]),
      assertQuery(query.Let({ x: 1, y: query.Var('x') }, function(x, y) { return { a: x, b: y }; }), { a: 1, b: 1 }),
      assertQuery(query.Query(query.Lambda(_ => query.Let([{x: 1}, {y: 2}], function(x, y) { return [x, y]; }))), new values.Query({lambda: '_', expr: {let: {x: 1, y: 2}, in: [{var: 'x'}, {var: 'y'}]}}))
   ]);
  });

  it('if', function () {
    var p1 = assertQuery(query.If(true, 't', 'f'), 't');
    var p2 = assertQuery(query.If(false, 't', 'f'), 'f');
    return Promise.all([p1, p2]);
  });

  it('do', function () {
    var p1 = create().then(function (i) {
      var ref = i.ref;
      return assertQuery(query.Do(query.Delete(ref), 1), 1).then(function () {
        return assertQuery(query.Exists(ref), false);
      });
    });

    var p2 = assertQuery(query.Do(1), 1);
    var p3 = assertQuery(query.Do(1, 2), 2);
    var p4 = assertQuery(query.Do([1, 2]), [1, 2]);

    return Promise.all([p1, p2, p3, p4]);
  });

  it('object', function () {
    var obj = query.Object({ x: query.Let({ x: 1 }, query.Var('x')) });
    return assertQuery(obj, { x: 1 });
  });

  it('lambda', function () {
    assert.throws(function () { query.Lambda(function () { return 0; } ); });

    assert.deepEqual(
      util.unwrapExpr(query.Lambda(function (a) { return query.Add(a, a); })),
      { lambda: 'a', expr: { add: [{ var: 'a' }, { var: 'a' }] } });

    var multi_args = query.Lambda(function (a, b) { return [b, a]; });
    assert.deepEqual(util.unwrapExpr(multi_args), {
      lambda: ['a', 'b'],
      expr: [{ var: 'b' }, { var: 'a' }]
    });

    // function() works too
    assert.deepEqual(multi_args, query.Lambda(function (a, b) { return [b, a]; }));

    return assertQuery(query.Map([[1, 2], [3, 4]], multi_args), [[2, 1], [4, 3]]);
  });

  it('call function', function () {
    var body = query.Query(function (a, b) {
      return query.Concat([a, b], '/');
    });

    return client.query(query.CreateFunction({ name: 'concat_with_slash', body: body })).then(function () {
      return assertQuery(query.Call(query.Function('concat_with_slash'), 'a', 'b'), 'a/b');
    });
  });

  it('call with object', function() {
    var body = query.Query(function (obj) {
      return query.Let({a: query.Select('a', obj), b: query.Select('b', obj)}, function(a, b) {
        return query.Concat([a, b], '/');
      });
    });

    return client.query(query.CreateFunction({ name: 'concat_with_slash_obj', body: body })).then(function () {
      return assertQuery(query.Call(query.Function('concat_with_slash_obj'), {a: 'a', b: 'b'}), 'a/b');
    });
  });

  it('echo query', function () {
    var lambda = function (x) { return x; };

    return client.query(query.Query(lambda)).then(function (body) {
      return client.query(body).then(function (bodyEchoed) {
        assert.deepEqual(body, bodyEchoed);
      });
    });
  });

  // Collection functions

  it('map', function () {
    var p1 = assertQuery(query.Map([1, 2, 3], function (a) { return query.Multiply([2, a]); } ), [2, 4, 6]);
    // Should work for manually constructed lambda too.
    var p2 = assertQuery(
      query.Map([1, 2, 3], query.Lambda('a', query.Multiply([2, query.Var('a')]))),
      [2, 4, 6]);

    var page = query.Paginate(nSet(1));
    var ns = query.Map(page, function (a) { return query.Select(['data', 'n'], query.Get(a)); });
    var p3 = assertQuery(ns, { data: [1, 1] });
    return Promise.all([p1, p2, p3]);
  });

  it('foreach', function () {
    return Promise.all([create(), create()]).then(function (results) {
      return [results[0].ref, results[1].ref];
    }).then(function (refs) {
      return client.query(query.Foreach(refs, query.Delete)).then(function() {
        var rv = [];
        refs.forEach(function(ref) {
          rv.push(assertQuery(query.Exists(ref), false));
        });

        return Promise.all(rv);
      });
    });
  });

  it('filter', function () {
    var p1 = assertQuery(query.Filter([1, 2, 3, 4], function (a) { return query.Equals(query.Modulo(a, 2), 0); } ), [2, 4]);

    // Works on page too
    var page = query.Paginate(nSet(1));
    var refsWithM = query.Filter(page, function (a) {
      return query.Contains(['data', 'm'], query.Get(a));
    });
    var p2 = assertQuery(refsWithM, { data: [refN1M1] });

    return Promise.all([p1, p2]);
  });

  it('take', function () {
    var p1 = assertQuery(query.Take(1, [1, 2]), [1]);
    var p2 = assertQuery(query.Take(3, [1, 2]), [1, 2]);
    var p3 = assertQuery(query.Take(-1, [1, 2]), []);

    return Promise.all([p1, p2, p3]);
  });

  it('drop', function () {
    var p1 = assertQuery(query.Drop(1, [1, 2]), [2]);
    var p2 = assertQuery(query.Drop(3, [1, 2]), []);
    var p3 = assertQuery(query.Drop(-1, [1, 2]), [1, 2]);

    return Promise.all([p1, p2, p3]);
  });

  it('prepend', function () {
    var p1 = assertQuery(query.Prepend([1, 2, 3], [4, 5, 6]), [1, 2, 3, 4, 5, 6]);
    // Fails for non-array.
    var p2 = assertBadQuery(query.Prepend([1, 2], 'foo'));

    return Promise.all([p1, p2]);
  });

  it('append', function () {
    var p1 = assertQuery(query.Append([4, 5, 6], [1, 2, 3]), [1, 2, 3, 4, 5, 6]);
    // Fails for non-array.
    var p2 = assertBadQuery(query.Append([1, 2], 'foo'));

    return Promise.all([p1, p2]);
  });

  it('is_empty', function () {
    return create({n: 100}).then(function () {
      var p1 = assertQuery(query.IsEmpty([]), true);
      var p2 = assertQuery(query.IsEmpty([1, 2, 3]), false);

      var p3 = assertQuery(query.IsEmpty(query.Paginate(nSet(99))), true);
      var p4 = assertQuery(query.IsEmpty(query.Paginate(nSet(100))), false);

      return Promise.all([p1, p2, p3, p4]);
    });
  });

  it('is_nonempty', function () {
    return create({n: 100}).then(function () {
      var p1 = assertQuery(query.IsNonEmpty([]), false);
      var p2 = assertQuery(query.IsNonEmpty([1, 2, 3]), true);

      var p3 = assertQuery(query.IsNonEmpty(query.Paginate(nSet(99))), false);
      var p4 = assertQuery(query.IsNonEmpty(query.Paginate(nSet(100))), true);

      return Promise.all([p1, p2, p3, p4]);
    });
  });

  // Read functions

  it('get', function () {
    return create().then(function (document) {
      return assertQuery(query.Get(document.ref), document);
    });
  });

  it('key_from_secret', function () {
    var client = util.rootClient;

    return client.query(query.CreateKey({ database: util.dbRef, role: 'server' })).then(function(key) {
      var p1 = client.query(query.Get(key.ref));
      var p2 = client.query(query.KeyFromSecret(key.secret));

      return Promise.all([p1, p2]).then(function(keys) {
        assert.deepEqual(keys[0], keys[1]);
      });
    });
  });

  it('reduce', function () {
    var client = util.client();

    return client.query(query.CreateCollection({name: 'reduce_cls'})).then(function(cls) {
      return client.query(query.CreateIndex({name: 'reduce_idx', source: cls.ref, values: [{field: ['data', 'value']}], active: true})).then(function(index) {
        return client.query(query.Foreach(range(1, 100), query.Lambda(i => query.Create(cls.ref, {data: {value: i}})))).then(function(insts) {
          var lambda = query.Lambda((acc, value) => query.Add(acc, value));

          //array
          var p1 = client.query(query.Reduce(lambda, 10, range(1, 100))).then(function(returned) {
            assert.equal(returned, 5060);
          });

          //page
          var p2 = client.query(query.Reduce(lambda, 10, query.Paginate(query.Match(index.ref), {size: 100}))).then(function(returned) {
            assert.deepEqual(returned, {data: [5060]});
          });

          //set
          var p3 = client.query(query.Reduce(lambda, 10, query.Match(index.ref))).then(function(returned) {
            assert.equal(returned, 5060);
          });

          return Promise.all([p1, p2, p3]);
        });
      });
    });
  });

  it('paginate', function () {
    var testSet = nSet(1);
    var p1 = assertQuery(query.Paginate(testSet), { data: [refN1, refN1M1] });
    var p2 = assertQuery(query.Paginate(testSet, { size: 1 }), { data: [refN1], after: [refN1M1] });
    var p3 = assertQuery(query.Paginate(testSet, { sources: true }), {
      data: [
        { sources: [new SetRef(util.unwrapExpr(testSet))], value: refN1 },
        { sources: [new SetRef(util.unwrapExpr(testSet))], value: refN1M1 }
      ]
    });

    return Promise.all([p1, p2, p3]);
  });

  it('exists', function () {
    return create().then(function (i) {
      var ref = i.ref;
      return assertQuery(query.Exists(ref), true).then(function() {
        return client.query(query.Delete(ref));
      }).then(function() {
        return assertQuery(query.Exists(ref), false);
      });
    });
  });

  // Write functions

  it('create', function () {
    return create().then(function (document) {
      assert('ref' in document);
      assert('ts' in document);
      assert.deepEqual(document.ref.collection, collectionRef);
    });
  });

  it('update', function () {
    return create().then(function (i) {
      var ref = i.ref;
      return client.query(query.Update(ref, { data: { m: 9 } })).then(function (got) {
        assert.deepEqual(got.data, { n: 0, m: 9 });
        return client.query(query.Update(ref, { data: { m: null } }));
      }).then(function (got) {
        assert.deepEqual(got.data, { n: 0 });
      });
    });
  });

  it('replace', function () {
    return create().then(function (i) {
      var ref = i.ref;
      return client.query(query.Replace(ref, { data: { m: 9 } }));
    }).then(function (got) {
      assert.deepEqual(got.data, { m: 9 });
    });
  });

  it('delete', function () {
    return create().then(function (i) {
      var ref = i.ref;
      client.query(query.Delete(ref)).then(function () {
        assertQuery(query.Exists(ref), false);
      });
    });
  });

  it('insert', function () {
    return createThimble({ weight: 1 }).then(function (document) {
      var ref = document.ref;
      var ts = document.ts;
      var prevTs = ts - 1;

      var inserted = { data: { weight: 0 } };

      return client.query(query.Insert(ref, prevTs, 'create', inserted)).then(function () {
        return client.query(query.Get(ref, prevTs));
      }).then(function (old) {
        assert.deepEqual(old.data, { weight: 0 });
      });
    });
  });

  it('remove', function () {
    return createThimble({ weight: 0 }).then(function (document) {
      var ref = document.ref;

      return client.query(query.Replace(ref, { data: { weight: 1 } })).then(function (newDocument) {
        return assertQuery(query.Get(ref), newDocument).then(function () {
          return client.query(query.Remove(ref, newDocument.ts, 'create'));
        }).then(function () {
          return assertQuery(query.Get(ref), document);
        });
      });
    });
  });

  it('create function', function () {
    var body = query.Query(function(x) { return x; });

    return client.query(query.CreateFunction({ name: 'a_function', body: body })).then(function () {
      return assertQuery(query.Exists(query.Function('a_function')), true);
    });
  });

  it('create role', function () {
    return withNewDatabase().then(function (client) {
      return client.query(query.CreateRole({
        name: 'a_role',
        privileges: [{
          resource: query.Databases(),
          actions: { read: true }
        }]
      })).then(function () {
        return assertQueryWithClient(client, query.Exists(query.Role('a_role')), true);
      });
    });
  });

  // Sets

  it('events', function () {
    return create().then(function (created) {
      var ref = created['ref'];

      return client.query(query.Update(ref, { data: { n: 100 } })).then(function () {
        return client.query(query.Delete(ref)).then(function () {
          return client.query(query.Paginate(query.Events(ref))).then(function (result) {
            var events = result['data'];

            assert.equal(events.length, 3);

            assert.equal(events[0].action, 'create');
            assert.deepEqual(events[0].document, ref);

            assert.equal(events[1].action, 'update');
            assert.deepEqual(events[1].document, ref);

            assert.equal(events[2].action, 'delete');
            assert.deepEqual(events[2].document, ref);
          });
        });
      });
    });
  });

  it('singleton', function () {
    return create().then(function (created) {
      var ref = created['ref'];

      return client.query(query.Update(ref, { data: { n: 100 } })).then(function () {
        return client.query(query.Delete(ref)).then(function () {
          return client.query(query.Paginate(query.Events(query.Singleton(ref)))).then(function (result) {
            var events = result['data'];

            assert.equal(events.length, 2);

            assert.equal(events[0].action, 'add');
            assert.deepEqual(events[0].document, ref);

            assert.equal(events[1].action, 'remove');
            assert.deepEqual(events[1].document, ref);
          });
        });
      });
    });
  });

  it('match', function () {
    return assertSet(nSet(1), [refN1, refN1M1]);
  });

  it('union', function () {
    return assertSet(query.Union(nSet(1), mSet(1)), [refN1, refM1, refN1M1]);
  });

  it('merge', function () {
    var p1 = assertQuery(query.Merge({}, {"x": 10, "y": 20}), {"x": 10, "y": 20});
    var p2 = assertQuery(query.Merge({"one": 1}, {"two": 2}), {"one": 1, "two": 2});
    var p3 = assertQuery(query.Merge({ x: 'x', y: 'y', z: 'z' }, { z: 'Zzz' }), { x: 'x', y: 'y', z: 'Zzz' });
    var p4 = assertQuery(query.Merge({}, [{x: 'x'}, {y: 'y'}, {z: 'z'}] ), { x: 'x', y: 'y', z: 'z' });
    var p5 = assertQuery(query.Merge({x: 'A'}, { x: 'x', y: 'y', z: 'z' }, query.Lambda( (key, left, right) => {return left;})), { x: 'A'});

    return Promise.all([p1, p2, p3, p4, p5]);
  });

  it('intersection', function () {
    return assertSet(query.Intersection(nSet(1), mSet(1)), [refN1M1]);
  });

  it('difference', function () {
    return assertSet(query.Difference(nSet(1), mSet(1)), [refN1]); // but not refN1M1
  });

  it('distinct', function() {
    var nonDistinctP = assertSet(query.Match(nCoveredIndexRef, 1), [10, 10, 15]);
    var distinctP = assertSet(query.Distinct(query.Match(nCoveredIndexRef, 1)), [10, 15]);

    return Promise.all([nonDistinctP, distinctP]);
  });

  it('join', function () {
    return create({ n: 12 }).then(function(res1) {
      return create({ n: 12 }).then(function(res2) {
        return [res1.ref, res2.ref];
      });
    }).then(function(referenced) {
      return create({ m: referenced[0] }).then(function(res1) {
        return create({ m: referenced[1] }).then(function(res2) {
          return [res1.ref, res2.ref];
        });
      }).then(function (referencers) {
        var source = nSet(12);

        var p1 = assertSet(source, referenced);

        // For each obj with n=12, get the set of elements whose data.m refers to it.
        var joined = query.Join(source, function (a) { return query.Match(mIndexRef, a); });
        var p2 = assertSet(joined, referencers);

        var joinedNonLambda = query.Join(source, mIndexRef);
        var p3 = assertSet(joinedNonLambda, referencers);
        return Promise.all([p1, p2, p3]);
      });
    });
  });

  // Authentication

  it('range', function () {
    return client.query(query.CreateCollection({name: 'range_cls'})).then(function(cls) {
      return client.query(query.CreateIndex({name: 'range_idx', source: cls.ref, values: [{field: ['data', 'value']}], active: true})).then(function(index) {
        return client.query(query.Foreach(range(1, 20), query.Lambda(i => query.Create(cls.ref, {data: {value: i}})))).then(function() {
          var m = query.Match(index.ref)

          var p1 = client.query(query.Paginate(query.Range(m, 3, 7))).then(function(returned) {
            assert.deepEqual(returned, {data: range(3, 7)});
          });

          var p2 = client.query(query.Paginate(query.Union(query.Range(m, 1, 10), query.Range(m, 11, 20)))).then(function(returned) {
            assert.deepEqual(returned, {data: range(1, 20)});
          });

          var p3 = client.query(query.Paginate(query.Difference(query.Range(m, 1, 20), query.Range(m, 11, 20)))).then(function(returned) {
            assert.deepEqual(returned, {data: range(1, 10)});
          });

          var p4 = client.query(query.Paginate(query.Intersection(query.Range(m, 1, 20), query.Range(m, 5, 15)))).then(function(returned) {
            assert.deepEqual(returned, {data: range(5, 15)});
          });

          return Promise.all([p1, p2, p3, p4]);
        });
      });
    });
  });

  it('login/logout', function () {
    return client.query(query.Create(collectionRef, { credentials: { password: 'sekrit' } })).then(function (result) {
      var documentRef = result.ref;
      return client.query(query.Login(documentRef, { password: 'sekrit' })).then(function (result2) {
        var secret = result2.secret;
        var instanceClient = util.getClient({ secret: secret });

        var self = new values.Ref('self', new values.Ref('widgets', Native.COLLECTIONS));
        return instanceClient.query(query.Select('ref', query.Get(self))).then(function (result3) {
          assert.deepEqual(result3, documentRef);

          return instanceClient.query(query.Logout(true));
        }).then(function (logoutResult) {
          assert.isTrue(logoutResult);
        });
      });
    });
  });

  it('identify', function () {
    return client.query(query.Create(collectionRef, { credentials: { password: 'sekrit' } })).then(function (result) {
      var documentRef = result.ref;
      return assertQuery(query.Identify(documentRef, 'sekrit'), true);
    });
  });

  it('has_identity', function () {
    return client.query(query.Create(collectionRef, { credentials: { password: 'sekrit' } })).then(function (result) {
      return client.query(query.Login(result['ref'], { password: 'sekrit' })).then(function (login) {
        var new_client = util.getClient({ secret: login['secret'] });

        return Promise.all([
          assertQueryWithClient(client, query.HasIdentity(), false),
          assertQueryWithClient(new_client, query.HasIdentity(), true)
        ]);
      });
    });
  });

  it('identity', function () {
    return client.query(query.Create(collectionRef, { credentials: { password: 'sekrit' } })).then(function (result) {
      return client.query(query.Login(result['ref'], { password: 'sekrit' })).then(function (login) {
        var new_client = util.getClient({ secret: login['secret'] });

        return assertQueryWithClient(new_client, query.Identity(), result['ref']);
      });
    });
  });

  // String functions

  it('concat', function () {
    var p1 = assertQuery(query.Concat(['a', 'b', 'c']), 'abc');
    var p2 = assertQuery(query.Concat([]), '');
    var p3 = assertQuery(query.Concat(['a', 'b', 'c'], '.'), 'a.b.c');

    return Promise.all([p1, p2, p3]);
  });

  it('casefold', function () {
    return Promise.all([
      assertQuery(query.Casefold('Hen Wen'), 'hen wen'),

      // https://unicode.org/reports/tr15/
      assertQuery(query.Casefold("\u212B", "NFD"), "A\u030A"),
      assertQuery(query.Casefold("\u212B", "NFC"), "\u00C5"),
      assertQuery(query.Casefold("\u1E9B\u0323", "NFKD"), "\u0073\u0323\u0307"),
      assertQuery(query.Casefold("\u1E9B\u0323", "NFKC"), "\u1E69"),

      assertQuery(query.Casefold("\u212B", "NFKCCaseFold"), "\u00E5")
    ]);
  });

  it('findstr', function () {
    var p1 = assertQuery(query.FindStr("ABC","A"), 0);
    var p2 = assertQuery(query.FindStr("ABC","A",0), 0);
    var p3 = assertQuery(query.FindStr("ABC","A",1), -1);
    var p4 = assertQuery(query.FindStr("a big apple","a", 2), 6);

    return Promise.all([p1, p2, p3, p4]);
  });

  it('findstrregex', function () {
    var p1 = assertQuery(query.FindStrRegex("ABC","A"),
                          [ { start: 0, end: 0, data: 'A' } ]
                         );
    var p2 = assertQuery(query.FindStrRegex("ABCAB","AB"),
                          [
                          { start: 0, end: 1, data: 'AB' } ,
                          { start: 3, end: 4, data: 'AB' }
                          ]
                        );
    var p3 = assertQuery(query.FindStrRegex("one fish two Fish","[fF]ish"),
                          [
                          { start: 4, end: 7, data: 'fish' } ,
                          { start: 13, end: 16, data: 'Fish' }
                          ]
    );

    return Promise.all([p1, p2, p3]);
  });

  it('length', function () {
    var p1 = assertQuery(query.Length(""), 0);
    var p2 = assertQuery(query.Length("A"), 1);
    var p3 = assertQuery(query.Length("ApPle"), 5);
    var p4 = assertQuery(query.Length("two words"), 9);

    return Promise.all([p1, p2, p3, p4]);
  });

  it('lowercase', function () {
    var p1 = assertQuery(query.LowerCase(""), "");
    var p2 = assertQuery(query.LowerCase("A"), "a");
    var p3 = assertQuery(query.LowerCase("ApPle"), 'apple');
    var p4 = assertQuery(query.LowerCase("İstanbul"), "i̇stanbul");

    return Promise.all([p1, p2, p3, p4]);
  });

  it('ltrim', function () {
    var p1 = assertQuery(query.LTrim(""), "");
    var p2 = assertQuery(query.LTrim("    A"), "A");
    var p3 = assertQuery(query.LTrim("\t\n\t\n  Apple"), 'Apple');
    var p4 = assertQuery(query.LTrim(" A B C"), "A B C");

    return Promise.all([p1, p2, p3, p4]);
  });

  it('ngram', function() {
    return Promise.all([
      assertQuery(query.NGram("what"), ["w", "wh", "h", "ha", "a", "at", "t"]),
      assertQuery(query.NGram("what", 2, 3), ["wh", "wha", "ha", "hat", "at"]),

      assertQuery(query.NGram(["john", "doe"]), ["j", "jo", "o", "oh", "h", "hn", "n", "d", "do", "o", "oe", "e"]),
      assertQuery(query.NGram(["john", "doe"], 3, 4), ["joh", "john", "ohn", "doe"])
    ]);
  });

  it('repeat', function () {
    var p1 = assertQuery(query.Repeat("A"), "AA");
    var p2 = assertQuery(query.Repeat("ABC", 3), "ABCABCABC");

    return Promise.all([p1, p2]);
  });

  it('replacestr', function () {
    var p1 = assertQuery(query.ReplaceStr("ABCDE","AB","AA"), "AACDE");
    var p2 = assertQuery(query.ReplaceStr("One Fish Two Fish","Fish","Cat"), "One Cat Two Cat");

    return Promise.all([p1, p2]);
  });

  it('replacestrregex', function () {
    var p1 = assertQuery(query.ReplaceStrRegex("ABCDE","AB","AA"), "AACDE");
    var p2 = assertQuery(query.ReplaceStrRegex("One Fish Two fish","[Ff]ish","Cat"), "One Cat Two Cat");

    return Promise.all([p1, p2]);
  });

  it('rtrim', function () {
    var p1 = assertQuery(query.RTrim("A\t\n   "), "A");
    var p2 = assertQuery(query.RTrim("ABC DE F "), "ABC DE F");

    return Promise.all([p1, p2]);
  });

  it('space', function () {
    var p1 = assertQuery(query.Space(0), "");
    var p2 = assertQuery(query.Space(5), "     ");

    return Promise.all([p1, p2]);
  });

  it('substring', function () {
    var p1 = assertQuery(query.SubString("ABCDEF",-3), "DEF");
    var p2 = assertQuery(query.SubString("ABCDEF",0,3), "ABC");

    return Promise.all([p1, p2]);
  });

  it('titlecase', function () {
    var p1 = assertQuery(query.TitleCase("one fISH tWo FISH"), "One Fish Two Fish");
    var p2 = assertQuery(query.TitleCase("ABC DEF"), "Abc Def");

    return Promise.all([p1, p2]);
  });

  it('trim', function () {
    var p1 = assertQuery(query.Trim("   A   "), "A");
    var p2 = assertQuery(query.Trim("\t\nABC DEF\t\n   "), "ABC DEF");

    return Promise.all([p1, p2]);
  });

  it('uppercase', function () {
    var p1 = assertQuery(query.UpperCase("a"), "A");
    var p2 = assertQuery(query.UpperCase("abc def"), "ABC DEF");

    return Promise.all([p1, p2]);
  });

  it('format', function () {
    var p1 = assertQuery(query.Format('%3$s%1$s %2$s', 'DB', 'rocks', 'Fauna'), 'FaunaDB rocks');
    var p2 = assertQuery(query.Format('%.4f', 3.14), '3.1400');
    var p3 = assertQuery(query.Format('%s %d %.2f', 'Hey', 1995, 6.02), 'Hey 1995 6.02');
    var p4 = assertQuery(query.Format('always 100%%'), 'always 100%');

    return Promise.all([p1, p2, p3, p4]);
  });

  // Time and date functions

  it('time', function () {
    var time = '1970-01-01T00:00:00.123456789Z';
    var p1 = assertQuery(query.Time(time), new FaunaTime(time));
    // 'now' refers to the current time.
    var p2 = client.query(query.Time('now')).then(function (result) {
      assert.instanceOf(result, FaunaTime);
    });

    return Promise.all([p1, p2]);
  });

  it('epoch', function () {
    var p1 = assertQuery(query.Epoch(12, 'second'), new FaunaTime('1970-01-01T00:00:12Z'));
    var nanoTime = new FaunaTime('1970-01-01T00:00:00.123456789Z');
    var p2 = assertQuery(query.Epoch(123456789, 'nanosecond'), nanoTime);
    return Promise.all([p1, p2]);
  });

  it('date', function () {
    return assertQuery(query.Date('1970-01-01'), new FaunaDate('1970-01-01'));
  });

  it('now', function () {
    return Promise.all([
      assertQuery(query.Equals(query.Now(), query.Time("now")), true),
      client.query(query.Now()).then(function (t0) {
        return client.query(query.Now()).then(function (t1) {
          return assertQuery(query.LTE(t0, t1, query.Now()), true)
        })
      })
    ]);
  });

  // Miscellaneous functions
  it('new_id', function() {
    return client.query(query.NewId()).then(function(res) {
      var parsed = parseInt(res);
      assert.isNotNaN(parsed);
      assert.isNumber(parsed);
    });
  });

  it('index', function() {
    return client.query(query.Index('widgets_by_n')).then(function(res) {
      assert.deepEqual(res, nIndexRef);
    });
  });

  it('collection', function () {
    return client.query(query.Collection('widgets')).then(function (res) {
      assert.deepEqual(res, collectionRef);
    });
  });

  it('equals', function () {
    var p1 = assertQuery(query.Equals(1, 1, 1), true);
    var p2 = assertQuery(query.Equals(1, 1, 2), false);
    var p3 = assertQuery(query.Equals(1), true);
    var p4 = assertQuery(query.Equals({a: 10, b: 20}, {a: 10, b: 20}), true);
    return Promise.all([p1, p2, p3, p4]);
  });

  it('contains', function () {
    var obj = { a: { b: 1 } };
    var p1 = assertQuery(query.Contains(['a', 'b'], obj), true);
    var p2 = assertQuery(query.Contains('a', obj), true);
    var p3 = assertQuery(query.Contains(['a', 'c'], obj), false);
    return Promise.all([p1, p2, p3]);
  });

  it('select', function () {
    var obj = { a: { b: 1 } };
    var p1 = assertQuery(query.Select('a', obj), { b: 1 });
    var p2 = assertQuery(query.Select(['a', 'b'], obj), 1);
    var p3 = assertQuery(query.Select('c', obj, null), null);
    var p4 = assertQuery(query.Select('c', obj, 'default'), 'default');
    var p5 = assertBadQuery(query.Select('c', obj), errors.NotFound);
    return Promise.all([p1, p2, p3, p4, p5]);
  });

  it('select for array', function () {
    var arr = [1, 2, 3];
    var p1 = assertQuery(query.Select(2, arr), 3);
    var p2 = assertBadQuery(query.Select(3, arr), errors.NotFound);
    return Promise.all([p1, p2]);
  });

  it('select_all', function () {
    var obj1 = {foo: 'bar'};
    var obj2 = {foo: 'baz'};
    return assertQuery(query.SelectAll('foo', [obj1, obj2]), ['bar', 'baz']);
  });

  it('select_all for array', function () {
    var obj1 = {foo: [0, 1]};
    var obj2 = {foo: [2, 3]};
    return assertQuery(query.SelectAll(['foo', 0], [obj1, obj2]), [0, 2]);
  });

  it('abs', function () {
    var p1 = assertQuery(query.Abs(10), 10);
    var p2 = assertQuery(query.Abs(-10), 10);
    return Promise.all([p1, p2]);
  });

  it('add', function () {
    return assertQuery(query.Add(2, 3, 5), 10);
  });

  it('bitand', function () {
    var p1 = assertQuery(query.BitAnd(1, 0), 0);
    var p2 = assertQuery(query.BitAnd(7, 3), 3);
    return Promise.all([p1, p2]);
  });

  it('bitnot', function () {
    var p1 = assertQuery(query.BitNot(0), -1);
    var p2 = assertQuery(query.BitNot(1), -2);
    return Promise.all([p1, p2]);
  });

  it('bitor', function () {
    var p1 = assertQuery(query.BitOr(0, 1, 0, 1), 1);
    var p2 = assertQuery(query.BitOr(1, 2, 4), 7);
    return Promise.all([p1, p2]);
  });

  it('bitxor', function () {
    var p1 = assertQuery(query.BitXor(0, 1 ), 1);
    var p2 = assertQuery(query.BitXor(1, 2, 4), 7);
    return Promise.all([p1, p2]);
  });

  it('ceil', function () {
    var p1 = assertQuery(query.Ceil(1.2), 2);
    var p2 = assertQuery(query.Ceil(1.8), 2);
    return Promise.all([p1, p2]);
  });

  it('divide', function () {
    // TODO: can't make this query because 2.0 === 2
    // await assertQuery(query.Divide(2, 3, 5), 2/15)
    var p1 = assertQuery(query.Divide(2), 2);
    var p2 = assertBadQuery(query.Divide(1, 0));
    return Promise.all([p1, p2]);
  });

  it('floor', function () {
    var p1 = assertQuery(query.Floor(1.2), 1);
    var p2 = assertQuery(query.Floor(1.8), 1);
    return Promise.all([p1, p2]);
  });

  it('max', function () {
    return assertQuery(query.Max(2, 3, 5, 4), 5);
  });

  it('min', function () {
    return assertQuery(query.Min(2, 3, 5, 4), 2);
  });

  it('modulo', function () {
    var p1 = assertQuery(query.Modulo(5, 2), 1);
    // This is (15 % 10) % 2
    var p2 = assertQuery(query.Modulo(15, 10, 2), 1);
    var p3 = assertQuery(query.Modulo(2), 2);
    var p4 = assertBadQuery(query.Modulo(1, 0));
    return Promise.all([p1, p2, p3, p4]);
  });

  it('multiply', function () {
    return assertQuery(query.Multiply(2, 3, 5), 30);
  });

  it('round', function () {
    var p1 = assertQuery(query.Round(155.678, -1), 160);
    var p2 = assertQuery(query.Round(155.678, 0), 156);
    var p3 = assertQuery(query.Round(155.678, 1), 155.7);
    var p4 = assertQuery(query.Round(155.678, 2), 155.68);
    return Promise.all([p1, p2, p3, p4]);
  });

  it('subtract', function () {
    var p1 = assertQuery(query.Subtract(2, 3, 5), -6);
    var p2 = assertQuery(query.Subtract(2), 2);
    return Promise.all([p1, p2]);
  });

  it('sign', function () {
    var p1 = assertQuery(query.Sign(1.2), 1);
    var p2 = assertQuery(query.Sign(1.8), 1);
    return Promise.all([p1, p2]);
  });

  it('sqrt', function () {
    var p1 = assertQuery(query.Sqrt(16), 4);
    var p2 = assertQuery(query.Sqrt(4), 2);
    return Promise.all([p1, p2]);
  });

  it('trunc', function () {
    var p1 = assertQuery(query.Trunc(155.678, -1), 150);
    var p2 = assertQuery(query.Trunc(155.678, 0), 155);
    var p3 = assertQuery(query.Trunc(155.678, 1), 155.6);
    var p4 = assertQuery(query.Trunc(155.678, 2), 155.67);
    return Promise.all([p1, p2, p3, p4]);
  });

  it('acos', function () {
    return assertQuery(query.Trunc(query.Acos(0.5), 2), 1.04);
  });

  it('asin', function () {
    var p1 = assertQuery(query.Trunc(query.Asin(0.5),2), 0.52);
    var p2 = assertQuery(query.Trunc(query.Asin(0),2), 0);
    return Promise.all([p1, p2]);
  });

  it('atan', function () {
    var p1 = assertQuery(query.Trunc(query.Atan(0.5),2), 0.46);
    var p2 = assertQuery(query.Trunc(query.Atan(0),2), 0);
    return Promise.all([p1, p2]);
  });

  it('cos', function () {
    return assertQuery(query.Cos(0), 1);
  });

  it('cosh', function () {
    return assertQuery(query.Trunc(query.Cosh(7.6), 1), 999);
  });

  it('degres', function () {
    return assertQuery(query.Trunc(query.Degrees(6.29), 0), 360);
  });

  it('exp', function () {
    return assertQuery(query.Trunc(query.Exp(5), 0), 148);
  });

  it('hypot', function () {
    return assertQuery(query.Hypot(query.Hypot(3, 4), 0), 5);
  });

  it('ln', function () {
    return assertQuery(query.Trunc(query.Ln(1), 0), 0);
  });

  it('log', function () {
    return assertQuery(query.Trunc(query.Log(100), 0), 2);
  });

  it('pow', function () {
    return assertQuery(query.Pow(3, 2), 9);
  });

  it('radians', function () {
    return assertQuery(query.Trunc(query.Radians(360), 1), 6.2);
  });

  it('sin', function () {
    return assertQuery(query.Trunc(query.Sin(0), 0), 0);
  });

  it('sinh', function () {
    return assertQuery(query.Trunc(query.Sinh(4), 0), 27);
  });

  it('tan', function () {
    return assertQuery(query.Trunc(query.Tan(0), 0), 0);
  });

  it('tanh', function () {
    return assertQuery(query.Trunc(query.Tanh(100), 0), 1);
  });


  it('lt', function () {
    return assertQuery(query.LT(1, 2), true);
  });

  it('lte', function () {
    return assertQuery(query.LTE(1, 1), true);
  });

  it('gt', function () {
    return assertQuery(query.GT(2, 1), true);
  });

  it('gte', function () {
    return assertQuery(query.GTE(1, 1), true);
  });

  it('and', function () {
    var p1 = assertQuery(query.And(true, true, false), false);
    var p2 = assertQuery(query.And(true, true, true), true);
    var p3 = assertQuery(query.And(true), true);
    var p4 = assertQuery(query.And(false), false);
    return Promise.all([p1, p2, p3, p4]);
  });

  it('or', function () {
    var p1 = assertQuery(query.Or(false, false, true), true);
    var p2 = assertQuery(query.Or(false, false, false), false);
    var p3 = assertQuery(query.Or(true), true);
    var p4 = assertQuery(query.Or(false), false);
    return Promise.all([p1, p2, p3, p4]);
  });

  it('not', function () {
    var p1 = assertQuery(query.Not(true), false);
    var p2 = assertQuery(query.Not(false), true);
    return Promise.all([p1, p2]);
  });

  it('to_string', function () {
    var p1 = assertQuery(query.ToString(42), "42");
    var p2 = assertQuery(query.ToString("42"), "42");
    return Promise.all([p1, p2]);
  });

  it('to_number', function () {
    var p1 = assertQuery(query.ToNumber(42), 42);
    var p2 = assertQuery(query.ToNumber("42"), 42);
    return Promise.all([p1, p2]);
  });

  it('to_time', function () {
    return assertQuery(query.ToTime("1970-01-01T00:00:00Z"), new FaunaTime("1970-01-01T00:00:00Z"));
  });

  it('to_millis', function () {
    var p1 = assertQuery(query.ToMillis(query.Time("1970-01-01T00:00:00Z")), 0);
    var p2 = assertQuery(query.ToMillis(query.Epoch(2147483648000, "millisecond")), 2147483648000);
    var p3 = assertQuery(query.ToMillis(0), 0);
    var p4 = assertQuery(query.ToMillis(2147483648000000), 2147483648000);
    return Promise.all([p1, p2, p3, p4]);
  });

  it('to_seconds', function () {
    var p1 = assertQuery(query.ToSeconds(query.Epoch(0, "second")), 0);
    var p2 = assertQuery(query.ToSeconds(query.Epoch(2147483648, "second")), 2147483648);
    var p3 = assertQuery(query.ToSeconds(0), 0);
    var p4 = assertQuery(query.ToSeconds(2147483648000000), 2147483648);
    return Promise.all([p1, p2, p3, p4]);
  });

  it('to_micros', function () {
    var p1 = assertQuery(query.ToMicros(query.Epoch(0, "second")), 0);
    var p2 = assertQuery(query.ToMicros(query.Epoch(2147483648000000, "microsecond")), 2147483648000000)
    var p3 = assertQuery(query.ToMicros(0), 0);
    var p4 = assertQuery(query.ToMicros(2147483648000000), 2147483648000000);
    return Promise.all([p1, p2, p3, p4]);
  });

  it('day_of_month', function () {
    var p1 = assertQuery(query.DayOfMonth(query.Epoch(0, "second")), 1);
    var p2 = assertQuery(query.DayOfMonth(query.Epoch(2147483648, "second")), 19);
    var p3 = assertQuery(query.DayOfMonth(0), 1);
    var p4 = assertQuery(query.DayOfMonth(2147483648000000), 19);
    return Promise.all([p1, p2, p3, p4]);
  });

  it('day_of_week', function () {
    var p1 = assertQuery(query.DayOfWeek(query.Epoch(0, "second")), 4);
    var p2 = assertQuery(query.DayOfWeek(query.Epoch(2147483648, "second")), 2);
    var p3 = assertQuery(query.DayOfWeek(0), 4);
    var p4 = assertQuery(query.DayOfWeek(2147483648000000), 2);
    return Promise.all([p1, p2, p3, p4]);
  });

  it('day_of_year', function () {
    var p1 = assertQuery(query.DayOfYear(query.Epoch(0, "second")), 1);
    var p2 = assertQuery(query.DayOfYear(query.Epoch(2147483648, "second")), 19);
    var p3 = assertQuery(query.DayOfYear(0), 1);
    var p4 = assertQuery(query.DayOfYear(2147483648000000), 19);
    return Promise.all([p1, p2, p3, p4]);
  });

  it('month', function () {
    var p1 = assertQuery(query.Month(query.Epoch(0, "second")), 1);
    var p2 = assertQuery(query.Month(query.Epoch(2147483648, "second")), 1);
    var p3 = assertQuery(query.Month(0), 1);
    var p4 = assertQuery(query.Month(2147483648000000), 1);
    return Promise.all([p1, p2, p3, p4]);
  });

  it('year', function () {
    var p1 = assertQuery(query.Year(query.Epoch(0, "second")), 1970);
    var p2 = assertQuery(query.Year(query.Epoch(2147483648, "second")), 2038);
    var p3 = assertQuery(query.Year(0), 1970);
    var p4 = assertQuery(query.Year(2147483648000000), 2038);
    return Promise.all([p1, p2, p3, p4]);
  });

  it('hour', function () {
    return assertQuery(query.Hour(query.Epoch(0, "second")), 0);
  });

  it('minute', function () {
    return assertQuery(query.Minute(query.Epoch(0, "second")), 0);
  });

  it('second', function () {
    return assertQuery(query.Second(query.Epoch(0, "second")), 0);
  });

  it('to_date', function () {
    return assertQuery(query.ToDate("1970-01-01"), new FaunaDate("1970-01-01"));
  });

  it('ref', function () {
    return assertQuery(Ref(collectionRef, query.Concat(['123', '456'])), new values.Ref('123456', collectionRef));
  });

  it('bytes', function() {
    return Promise.all([
      assertQuery(query.Bytes('AQIDBA=='), new Bytes('AQIDBA==')),
      assertQuery(query.Bytes(new Uint8Array([0, 0, 0, 0])), new Bytes('AAAAAA==')),
      assertQuery(query.Bytes(new ArrayBuffer(4)), new Bytes('AAAAAA==')),
      assertQuery(new Bytes('AQIDBA=='), new Bytes('AQIDBA==')),
      assertQuery(new Uint8Array([0, 0, 0, 0]), new Bytes('AAAAAA==')),
      assertQuery(new ArrayBuffer(4), new Bytes('AAAAAA=='))
    ]);
  });

  it('recursive refs', function() {
    return withNewDatabase().then(function (adminCli) {
      return createNewDatabase(adminCli, 'parent-db').then(function(parentCli) {
        return createNewDatabase(parentCli, 'child-db').then(function(childCli) {
          return childCli.query(
            query.Do(
              query.CreateDatabase({ name: 'a_db' }),
              query.CreateCollection({ name: 'a_collection' }),
              query.CreateIndex({ name: 'a_index', active: true, source: query.Ref('collections') }),
              query.CreateFunction({ name: 'a_function', body: query.Query(function(a) { return a }) }),
              query.CreateRole({ name: 'a_role', privileges: { resource: query.Collections(), actions: { read: true }}}),
              query.Create(query.Ref('keys/123'), { database: query.Database('a_db'), role: 'server' })
            )
          ).then(function() {
            var childDb = query.Database('child-db');
            var childDbRef = new values.Ref('child-db', Native.DATABASES);
            var nestedDb = query.Database('child-db', query.Database('parent-db'));
            var nestedCollection = query.Collection('a_collection', nestedDb);
            var nestedCollectionRef = new values.Ref('a_collection', Native.COLLECTIONS, new values.Ref(
              'child-db', Native.DATABASES, new values.Ref(
                'parent-db', Native.DATABASES
              )
            ));

            return Promise.all([
              // Recursive from the top most database
              assertQueryWithClient(adminCli, query.Exists(nestedCollection), true),
              assertQueryWithClient(adminCli, query.Paginate(query.Collections(nestedDb)), { data: [ nestedCollectionRef ] }),

              // Non-recursive builtin references
              assertQueryWithClient(childCli, query.Paginate(query.Collections()), { data: [ new values.Ref('a_collection', Native.COLLECTIONS) ] }),
              assertQueryWithClient(childCli, query.Paginate(query.Databases()), { data: [ new values.Ref('a_db', Native.DATABASES) ] }),
              assertQueryWithClient(childCli, query.Paginate(query.Indexes()), { data: [ new values.Ref('a_index', Native.INDEXES) ] }),
              assertQueryWithClient(childCli, query.Paginate(query.Functions()), { data: [ new values.Ref('a_function', Native.FUNCTIONS) ] }),
              assertQueryWithClient(childCli, query.Paginate(query.Roles()), { data: [ new values.Ref('a_role', Native.ROLES) ] }),
              assertQueryWithClient(childCli, query.Paginate(query.Keys()), { data: [ new values.Ref('123', Native.KEYS) ] }),
              assertQueryWithClient(childCli, query.Paginate(query.Tokens()), { data: [] }),
              assertQueryWithClient(childCli, query.Paginate(query.Credentials()), { data: [] }),

              // Recursive built-in references
              assertQueryWithClient(parentCli, query.Paginate(query.Collections(childDb)), { data: [ new values.Ref('a_collection', Native.COLLECTIONS, childDbRef) ] }),
              assertQueryWithClient(parentCli, query.Paginate(query.Databases(childDb)), { data: [ new values.Ref('a_db', Native.DATABASES, childDbRef) ] }),
              assertQueryWithClient(parentCli, query.Paginate(query.Indexes(childDb)), { data: [ new values.Ref('a_index', Native.INDEXES, childDbRef) ] }),
              assertQueryWithClient(parentCli, query.Paginate(query.Functions(childDb)), { data: [ new values.Ref('a_function', Native.FUNCTIONS, childDbRef) ] }),
              assertQueryWithClient(parentCli, query.Paginate(query.Roles(childDb)), { data: [ new values.Ref('a_role', Native.ROLES, childDbRef) ] }),
              assertQueryWithClient(parentCli, query.Paginate(query.Keys(childDb)), { data: [ new values.Ref('123', Native.KEYS) ] }),
              assertQueryWithClient(parentCli, query.Paginate(query.Tokens(childDb)), { data: [] }),
              assertQueryWithClient(parentCli, query.Paginate(query.Credentials(childDb)), { data: [] })
            ]);
          });
        });
      });
    });
  });

  it('nested ref from string', function() {
    return assertQuery(query.Ref('collections/widget/123'), new values.Ref('123', new values.Ref('widget', Native.COLLECTIONS)));
  });

  // Check arity of all query functions

  it('arity', function () {
    // By default assume all functions should have strict arity
    var testParams = {
      'Ref': [3, 'from 1 to 2'],
      'Do': [0, 'at least 1'],
      'Lambda': [3, 'from 1 to 2'],
      'Call': [0, 'at least 1'],
      'Get': [3, 'from 1 to 2'],
      'Paginate': [3, 'from 1 to 2'],
      'Exists': [3, 'from 1 to 2'],
      'Create': [3, 'from 1 to 2'],
      'Match': [0, 'at least 1'],
      'Union': [0, 'at least 1'],
      'Merge': [0, 'from 2 to 3'],
      'Intersection': [0, 'at least 1'],
      'Difference': [0, 'at least 1'],
      'Format': [0, 'at least 1'],
      'Concat': [0, 'at least 1'],
      'Casefold': [0, 'at least 1'],
      'FindStr': [0, 'from 2 to 3'],
      'FindStrRegex': [0, 'from 2 to 4'],
      'NGram': [0, 'from 1 to 3'],
      'Repeat': [0, 'from 1 to 2'],
      'ReplaceStrRegex': [0, 'from 3 to 4'],
      'SubString': [0, 'from 1 to 3'],
      'Equals': [0, 'at least 1'],
      'Select': [4, 'from 2 to 3'],
      'Add': [0, 'at least 1'],
      'BitAnd': [0, 'at least 1'],
      'BitOr': [0, 'at least 1'],
      'BitXor': [0, 'at least 1'],
      'Divide': [0, 'at least 1'],
      'Max': [0, 'at least 1'],
      'Min': [0, 'at least 1'],
      'Modulo': [0, 'at least 1'],
      'Multiply': [0, 'at least 1'],
      'Round': [0, 'at least 1'],
      'Subtract': [0, 'at least 1'],
      'Trunc': [0, 'at least 1'],
      'Hypot': [0, 'at least 1'],
      'Pow': [0, 'at least 1'],
      'LT': [0, 'at least 1'],
      'LTE': [0, 'at least 1'],
      'GT': [0, 'at least 1'],
      'GTE': [0, 'at least 1'],
      'And': [0, 'at least 1'],
      'Or': [0, 'at least 1'],
      'Index': [3, 'from 1 to 2'],
      'Class': [3, 'from 1 to 2'],
      'Collection': [3, 'from 1 to 2'],
      'Database': [3, 'from 1 to 2'],
      'Function': [3, 'from 1 to 2'],
      'Role': [3, 'from 1 to 2'],
      'Classes': [2, 'up to 1'],
      'Collections': [2, 'up to 1'],
      'Databases': [2, 'up to 1'],
      'Indexes': [2, 'up to 1'],
      'Functions': [2, 'up to 1'],
      'Roles': [2, 'up to 1'],
      'Keys': [2, 'up to 1'],
      'Tokens': [2, 'up to 1'],
      'Credentials': [2, 'up to 1']
    };

    for (var fun in query) {
      var params = testParams[fun] || [],
        arity = params[0] !== undefined ? params[0] : 100,
        errorMessage = new RegExp(
          'Function requires ' + (params[1] || '\\d+') +
            ' arguments but ' + arity + ' were given');
      assert.throws(function () { query[fun].apply(null, new Array(arity)); }, errors.InvalidArity, errorMessage, fun);
    }
  });


  // Helpers

  it('varargs', function () {
    // Works for lists too
    var p1 = assertQuery(query.Add([2, 3, 5]), 10);
    // Works for a variable equal to a list
    var p2 = assertQuery(query.Let({ x: [2, 3, 5] }, query.Add(query.Var('x'))), 10);
    return Promise.all([p1, p2]);
  });
});

function withNewDatabase() {
  return util.rootClient.query(
    query.CreateKey({
      database: util.dbRef,
      role: 'admin'
    })
  ).then(function(adminKey) {
    var adminCli = util.getClient({ secret: adminKey.secret });
    return createNewDatabase(adminCli, util.randomString('sub_db_'));
  });
}

function createNewDatabase(client, name) {
  return client.query(query.CreateDatabase({ name: name })).then(function() {
    return client.query(query.CreateKey({ database: query.Database(name), role: 'admin' })).then(function(key) {
      return util.getClient({ secret: key.secret });
    });
  });
}

function create(data) {
  if (typeof data === 'undefined') {
    data = {};
  }

  if (data.n === undefined) {
    data.n = 0;
  }

  return client.query(query.Create(collectionRef, { data: data }));
}

function createThimble(data) {
  return client.query(query.Create(thimbleCollectionRef, { data: data }));
}

function nSet(n) {
  return query.Match(nIndexRef, n);
}

function mSet(m) {
  return query.Match(mIndexRef, m);
}

function assertQueryWithClient(client, query, expected) {
  return client.query(query).then(function (result) {
    assert.deepEqual(result, expected);
  });
}

function assertQuery(query, expected) {
  return assertQueryWithClient(client, query, expected);
}

function assertBadQuery(query, errorType) {
  if (typeof errorType === 'undefined') {
    errorType = errors.BadRequest;
  }

  return util.assertRejected(client.query(query), errorType);
}

function assertSet(set, expected) {
  return getSetContents(set).then(function (result) {
    assert.deepEqual(result, expected);
  });
}

function getSetContents(set) {
  return client.query(query.Paginate(set, { size: 1000 })).then(function (result) {
    return result.data;
  });
}

function range(start, end) {
  var values = [];

  for (var i = start; i <= end; i++)
    values.push(i);

  return values;
}
