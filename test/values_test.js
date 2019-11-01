'use strict';

var util = require('util');
var assert = require('chai').assert;
var errors = require('../src/errors');
var json = require('../src/_json');
var Expr = require('../src/Expr');
var values = require('../src/values');
var q = require('../src/query');

var FaunaDate = values.FaunaDate,
  FaunaTime = values.FaunaTime,
  Ref = values.Ref,
  SetRef = values.SetRef,
  Bytes = values.Bytes,
  Query = values.Query;


describe('Values', function() {
  var
    ref = new Ref('123', new Ref('frogs', values.Native.COLLECTIONS)),
    jsonRef = '{"@ref":{"id":"123","collection":{"@ref":{"id":"frogs","collection":{"@ref":{"id":"collections"}}}}}}';

  it('ref', function () {
    assert.deepEqual(json.parseJSON(jsonRef), ref);
    assert.equal(json.toJSON(ref), jsonRef);

    assert.equal(ref.id, '123');
    assert.deepEqual(ref.collection, new Ref('frogs', values.Native.COLLECTIONS));
    assert.equal(ref.database, undefined);

    assert.throws(function() { new Ref(); }, errors.InvalidValue, 'id cannot be null or undefined');
  });

  it('serializes expr', function() {
    var expr = new Expr({ some: 'stringField', num: 2 });
    assert.equal(json.toJSON(expr), '{"some":"stringField","num":2}');
  });

  it('set', function () {
    var
      index = new Ref('frogs_by_size', values.Native.INDEXES),
      jsonIndex = '{"@ref":{"id":"frogs_by_size","collection":{"@ref":{"id":"indexes"}}}}',
      match = new SetRef({ match: index, terms: ref }),
      jsonMatch = '{"@set":{"match":' + jsonIndex + ',"terms":' + jsonRef + '}}';
    assert.deepEqual(json.parseJSON(jsonMatch), match);
    assert.equal(json.toJSON(match), jsonMatch);
  });

  it('time conversion', function () {
    var dt = new Date();
    assert.deepEqual(new FaunaTime(dt).date, dt);

    var epoch = new Date(Date.UTC(1970, 0, 1));
    var ft = new FaunaTime(epoch);
    assert.deepEqual(ft, new FaunaTime('1970-01-01T00:00:00.000Z'));
    assert.deepEqual(ft.date, epoch);

    // time offset not allowed
    assert.throws(function() {
      return new FaunaTime('1970-01-01T00:00:00.000+04:00');
    }, errors.InvalidValue);
  });

  it('time', function () {
    var test_ts = new FaunaTime('1970-01-01T00:00:00.123456789Z');
    var test_ts_json = '{"@ts":"1970-01-01T00:00:00.123456789Z"}';
    assert.equal(json.toJSON(test_ts), test_ts_json);
    assert.deepEqual(json.parseJSON(test_ts_json), test_ts);
  });

  it('date conversion', function () {
    var now = new Date(Date.now());
    var dt = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    assert.deepEqual(new FaunaDate(dt).date, dt);

    var epoch = new Date(Date.UTC(1970, 0, 1));
    var fd = new FaunaDate(epoch);
    assert.deepEqual(fd, new FaunaDate('1970-01-01'));
    assert.deepEqual(fd.date, epoch);
  });

  it('date', function () {
    var test_date = new FaunaDate(new Date(1970, 0, 1));
    var test_date_json = '{"@date":"1970-01-01"}';
    assert.equal(json.toJSON(test_date), test_date_json);
    assert.deepEqual(json.parseJSON(test_date_json), test_date);
  });

  it('bytes - string base64', function () {
    var test_bytes = new Bytes('AQIDBA==');
    var test_bytes_json = '{"@bytes":"AQIDBA=="}';
    assert.equal(json.toJSON(test_bytes), test_bytes_json);
    assert.deepEqual(json.parseJSON(test_bytes_json), test_bytes);
  });

  it('bytes - Uint8Array', function () {
    var test_bytes = new Bytes(new Uint8Array([1,2,3,4]));
    var test_bytes_json = '{"@bytes":"AQIDBA=="}';
    assert.equal(json.toJSON(test_bytes), test_bytes_json);
    assert.deepEqual(json.parseJSON(test_bytes_json), test_bytes);
  });

  it('bytes - ArrayBuffer', function () {
    var test_bytes = new Bytes(new ArrayBuffer(4));
    var test_bytes_json = '{"@bytes":"AAAAAA=="}';
    assert.equal(json.toJSON(test_bytes), test_bytes_json);
    assert.deepEqual(json.parseJSON(test_bytes_json), test_bytes);
  });

  it('bytes - errors', function() {
    assert.throws(function() { new Bytes(10); }, errors.InvalidValue, 'Bytes type expect argument to be either Uint8Array|ArrayBuffer|string, got: 10');
    assert.throws(function() { new Bytes(3.14); }, errors.InvalidValue, 'Bytes type expect argument to be either Uint8Array|ArrayBuffer|string, got: 3.14');
    assert.throws(function() { new Bytes({}); }, errors.InvalidValue, 'Bytes type expect argument to be either Uint8Array|ArrayBuffer|string, got: {}');
    assert.throws(function() { new Bytes([]); }, errors.InvalidValue, 'Bytes type expect argument to be either Uint8Array|ArrayBuffer|string, got: []');
    assert.throws(function() { new Bytes(null); }, errors.InvalidValue, 'Bytes type expect argument to be either Uint8Array|ArrayBuffer|string, got: null');
    assert.throws(function() { new Bytes(undefined); }, errors.InvalidValue, 'Bytes type expect argument to be either Uint8Array|ArrayBuffer|string, got: undefined');
  });

  it('query', function() {
    var test_query = new Query({ lambda: 'x', expr: { var: 'x' } });
    var test_query_json = '{"@query":{"lambda":"x","expr":{"var":"x"}}}';
    assert.equal(json.toJSON(test_query), test_query_json);
    assert.deepEqual(json.parseJSON(test_query_json), test_query);
  });

  var assertPrint = function(value, expected) {
    assert.equal(expected, util.inspect(value, {depth: null}));
    assert.equal(expected, value.toString());
  };

  it('pretty print', function() {
    assertPrint(new Ref('col', values.Native.COLLECTIONS), 'Collection("col")');
    assertPrint(new Ref('db', values.Native.DATABASES), 'Database("db")');
    assertPrint(new Ref('idx', values.Native.INDEXES), 'Index("idx")');
    assertPrint(new Ref('fn', values.Native.FUNCTIONS), 'Function("fn")');
    assertPrint(new Ref('role', values.Native.ROLES), 'Role("role")');
    assertPrint(new Ref('key', values.Native.KEYS), 'Ref(Keys(), "key")');

    assertPrint(values.Native.COLLECTIONS, 'Collections()');
    assertPrint(values.Native.DATABASES, 'Databases()');
    assertPrint(values.Native.INDEXES, 'Indexes()');
    assertPrint(values.Native.FUNCTIONS, 'Functions()');
    assertPrint(values.Native.ROLES, 'Roles()');
    assertPrint(values.Native.KEYS, 'Keys()');

    var db = new Ref("db", values.Native.DATABASES);
    assertPrint(new Ref('col', values.Native.COLLECTIONS, db), 'Collection("col", Database("db"))');
    assertPrint(new Ref('db', values.Native.DATABASES, db), 'Database("db", Database("db"))');
    assertPrint(new Ref('idx', values.Native.INDEXES, db), 'Index("idx", Database("db"))');
    assertPrint(new Ref('fn', values.Native.FUNCTIONS, db), 'Function("fn", Database("db"))');
    assertPrint(new Ref('role', values.Native.ROLES, db), 'Role("role", Database("db"))');
    assertPrint(new Ref('key', values.Native.KEYS, db), 'Ref(Keys(Database("db")), "key")');

    assertPrint(new FaunaTime('1970-01-01T00:00:00.123456789Z'), 'Time("1970-01-01T00:00:00.123456789Z")');
    assertPrint(new FaunaDate('1970-01-01'), 'Date("1970-01-01")');

    assertPrint(new Bytes('1234'), 'Bytes("1234")');

    function mkIndex(name) {
      return new Ref(name, values.Native.INDEXES);
    }

    assertPrint(
      new SetRef({"match": mkIndex('idx')}),
      'Match(Index("idx"))'
    );
    //todo: add Map/Foreach when it supports sets
    assertPrint(
      new SetRef({'filter': {'lambda': 'ref', 'expr': true}, 'collection': values.Native.INDEXES}),
      'Filter(Indexes(), Lambda("ref", true))'
    );
    assertPrint(
      new SetRef({ union: [ new SetRef({ match: mkIndex("idx1") }), new SetRef({ match: mkIndex("idx4") }) ] }),
      'Union(Match(Index("idx1")), Match(Index("idx4")))'
    );
    assertPrint(
      new SetRef({ intersection: [ new SetRef({ match: mkIndex("idx1") }), new SetRef({ match: mkIndex("idx4") }) ] }),
      'Intersection(Match(Index("idx1")), Match(Index("idx4")))'
    );
    assertPrint(
      new SetRef({ difference: [ new SetRef({ match: mkIndex("idx1") }), new SetRef({ match: mkIndex("idx4") }) ] }),
      'Difference(Match(Index("idx1")), Match(Index("idx4")))'
    );
    assertPrint(
      new SetRef({ distinct: new SetRef({ match: mkIndex("idx1") }) }),
      'Distinct(Match(Index("idx1")))'
    );
  });

  it('pretty print Query', function() {
    assertPrint(new Query(q.Lambda('x', q.Var('x'))), 'Query(Lambda("x", Var("x")))');
    assertPrint(
      new Query(q.Lambda(['x', 'y'], q.If(q.GT(q.Var('x'), q.Var('y')), 'x > y', 'x <= y'))),
      'Query(Lambda(["x", "y"], If(GT(Var("x"), Var("y")), "x > y", "x <= y")))'
    );
    assertPrint(
      new Query(q.Lambda('ref', q.Select(['data', 'name'], q.Get(q.Var('ref'))))),
      'Query(Lambda("ref", Select(["data", "name"], Get(Var("ref")))))'
    );

    //returns object
    assertPrint(
      new Query(q.Lambda(['x', 'y'], {sum: q.Add(q.Var('x'), q.Var('y')), product: q.Multiply(q.Var('x'), q.Var('y'))})),
      'Query(Lambda(["x", "y"], {sum: Add(Var("x"), Var("y")), product: Multiply(Var("x"), Var("y"))}))'
    );

    //returns array
    assertPrint(
      new Query(q.Lambda(['x', 'y'], [q.Add(q.Var('x'), q.Var('y')), q.Multiply(q.Var('x'), q.Var('y'))])),
      'Query(Lambda(["x", "y"], [Add(Var("x"), Var("y")), Multiply(Var("x"), Var("y"))]))'
    );

    //underscored names
    assertPrint(
      new Query(q.Lambda('ref', q.SelectAsIndex(['data', 'name'], q.Get(q.Var('ref'))))),
      'Query(Lambda("ref", SelectAsIndex(["data", "name"], Get(Var("ref")))))'
    );
    assertPrint(
      new Query(q.Lambda('coll', q.IsEmpty(q.Var('coll')))),
      'Query(Lambda("coll", IsEmpty(Var("coll"))))'
    );
    assertPrint(
      new Query(q.Lambda('secret', q.KeyFromSecret(q.Var('secret')))),
      'Query(Lambda("secret", KeyFromSecret(Var("secret"))))'
    );

    //special case
    assertPrint(
      new Query(q.Lambda('coll', q.IsNonEmpty(q.Var('coll')))),
      'Query(Lambda("coll", IsNonEmpty(Var("coll"))))'
    );

    //vararg functions
    assertPrint(
      new Query(q.Lambda('x', q.Do(q.Var('x'), q.Var('x')))),
      'Query(Lambda("x", Do(Var("x"), Var("x"))))'
    );
    assertPrint(
      new Query(q.Lambda('ref', q.Call(q.Var('ref'), 1, 2, 3))),
      'Query(Lambda("ref", Call(Var("ref"), 1, 2, 3)))'
    );
    assertPrint(
      new Query(q.Lambda(['x', 'y'], q.Union(q.Var('x'), q.Var('y')))),
      'Query(Lambda(["x", "y"], Union(Var("x"), Var("y"))))'
    );
    assertPrint(
      new Query(q.Lambda(['x', 'y'], q.Intersection(q.Var('x'), q.Var('y')))),
      'Query(Lambda(["x", "y"], Intersection(Var("x"), Var("y"))))'
    );
    assertPrint(
      new Query(q.Lambda(['x', 'y'], q.Difference(q.Var('x'), q.Var('y')))),
      'Query(Lambda(["x", "y"], Difference(Var("x"), Var("y"))))'
    );
    assertPrint(
      new Query(q.Lambda(['x', 'y'], q.Equals(q.Var('x'), q.Var('y')))),
      'Query(Lambda(["x", "y"], Equals(Var("x"), Var("y"))))'
    );
    assertPrint(
      new Query(q.Lambda(['x', 'y'], q.Add(q.Var('x'), q.Var('y')))),
      'Query(Lambda(["x", "y"], Add(Var("x"), Var("y"))))'
    );
    assertPrint(
      new Query(q.Lambda(['x', 'y'], q.Multiply(q.Var('x'), q.Var('y')))),
      'Query(Lambda(["x", "y"], Multiply(Var("x"), Var("y"))))'
    );
    assertPrint(
      new Query(q.Lambda(['x', 'y'], q.Subtract(q.Var('x'), q.Var('y')))),
      'Query(Lambda(["x", "y"], Subtract(Var("x"), Var("y"))))'
    );
    assertPrint(
      new Query(q.Lambda(['x', 'y'], q.Divide(q.Var('x'), q.Var('y')))),
      'Query(Lambda(["x", "y"], Divide(Var("x"), Var("y"))))'
    );
    assertPrint(
      new Query(q.Lambda(['x', 'y'], q.Modulo(q.Var('x'), q.Var('y')))),
      'Query(Lambda(["x", "y"], Modulo(Var("x"), Var("y"))))'
    );
    assertPrint(
      new Query(q.Lambda(['x', 'y'], q.LT(q.Var('x'), q.Var('y')))),
      'Query(Lambda(["x", "y"], LT(Var("x"), Var("y"))))'
    );
    assertPrint(
      new Query(q.Lambda(['x', 'y'], q.LTE(q.Var('x'), q.Var('y')))),
      'Query(Lambda(["x", "y"], LTE(Var("x"), Var("y"))))'
    );
    assertPrint(
      new Query(q.Lambda(['x', 'y'], q.GT(q.Var('x'), q.Var('y')))),
      'Query(Lambda(["x", "y"], GT(Var("x"), Var("y"))))'
    );
    assertPrint(
      new Query(q.Lambda(['x', 'y'], q.GTE(q.Var('x'), q.Var('y')))),
      'Query(Lambda(["x", "y"], GTE(Var("x"), Var("y"))))'
    );
    assertPrint(
      new Query(q.Lambda(['x', 'y'], q.And(q.Var('x'), q.Var('y')))),
      'Query(Lambda(["x", "y"], And(Var("x"), Var("y"))))'
    );
    assertPrint(
      new Query(q.Lambda(['x', 'y'], q.Or(q.Var('x'), q.Var('y')))),
      'Query(Lambda(["x", "y"], Or(Var("x"), Var("y"))))'
    );

    //nested varargs
    assertPrint(
      new Query(q.Lambda(['x', 'y'], q.Add(q.Var('x'), q.Add(q.Var('y'), 1)))),
      'Query(Lambda(["x", "y"], Add(Var("x"), Add(Var("y"), 1))))'
    );

    //let expr
    assertPrint(
      new Query(q.Lambda('_', q.Let({x: 10, y: 20}, q.Var('x')))),
      'Query(Lambda("_", Let([{x: 10}, {y: 20}], Var("x"))))'
    );

    assertPrint(
      new Query(q.Lambda('_', q.Let([{x: 10}, {y: 20}], q.Var('x')))),
      'Query(Lambda("_", Let([{x: 10}, {y: 20}], Var("x"))))'
    );

    // filter expr
    assertPrint(
      new Query(q.Filter([1, 2, 3], q.Lambda('i', q.Equals(0, q.Modulo(q.Var('i'), 2))))),
      'Query(Filter([1, 2, 3], Lambda("i", Equals(0, Modulo(Var("i"), 2)))))'
    );

    // map expr
    assertPrint(
      new Query(q.Map([1, 2, 3], q.Lambda('i', q.Equals(0, q.Modulo(q.Var('i'), 2))))),
      'Query(Map([1, 2, 3], Lambda("i", Equals(0, Modulo(Var("i"), 2)))))'
    );

    // foreach expr
    assertPrint(
      new Query(q.Foreach([1, 2, 3], q.Lambda('i', q.Equals(0, q.Modulo(q.Var('i'), 2))))),
      'Query(Foreach([1, 2, 3], Lambda("i", Equals(0, Modulo(Var("i"), 2)))))'
    );
  });

  it('pretty print Expr with primitive types', function() {
    assertPrint(
      new Query(q.Lambda('_', {x: true, y: false, z: 'str', w: 10})),
      'Query(Lambda("_", {x: true, y: false, z: "str", w: 10}))'
    );

    assertPrint(
      new Query(q.Lambda('_', [true, false, 'str', 10])),
      'Query(Lambda("_", [true, false, "str", 10]))'
    );

    assertPrint(
      new Query(q.Lambda('_', [null, undefined])),
      'Query(Lambda("_", [null, undefined]))'
    );

    assertPrint(
      new Query(q.Lambda('_', Symbol('foo'))),
      'Query(Lambda("_", "foo"))'
    );
  });
});
