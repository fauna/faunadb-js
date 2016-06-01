var assert = require('chai').assert;
var errors = require('../src/errors');
var Expr = require('../src/Expr');
var objects = require('../src/objects');

var FaunaDate = objects.FaunaDate,
  FaunaTime = objects.FaunaTime,
  Page = objects.Page,
  Ref = objects.Ref,
  SetRef = objects.SetRef;

var json = require('../src/_json');
var query = require('../src/query');

describe('objects', function() {
  var
    ref = new Ref('classes', 'frogs', '123'),
    jsonRef = '{"@ref":"classes/frogs/123"}';

  it('ref', function () {
    assert.deepEqual(json.parseJSON(jsonRef), ref);
    assert.equal(json.toJSON(ref), jsonRef);

    var blobs = new Ref('classes', 'blobs');
    var blobRef = new Ref(blobs, '123');

    assert.deepEqual(blobRef.class, blobs);
    assert.equal(blobRef.id, '123');

    var keys = new Ref('keys');
    assert.deepEqual(keys.class, keys);
    assert.throws(function () { return keys.id; }, errors.InvalidValue);

    var keyRef = new Ref(keys, '123');
    assert.deepEqual(keyRef.class, keys);
    assert.equal(keyRef.id, '123');

    // valueOf converts to string
    assert.equal('' + blobRef, 'classes/blobs/123');
  });

  it('serializes expr', function() {
    var expr = new Expr({ some: 'stringField', num: 2 });
    assert.equal(json.toJSON(expr), '{"some":"stringField","num":2}');
  });

  it('set', function () {
    var
      index = new Ref('indexes', 'frogs_by_size'),
      jsonIndex = '{"@ref":"indexes/frogs_by_size"}',
      match = new SetRef({ match: index, terms: ref }),
      jsonMatch = '{"@set":{"match":' + jsonIndex + ',"terms":' + jsonRef + '}}';
    assert.deepEqual(json.parseJSON(jsonMatch), match);
    assert.equal(json.toJSON(match), jsonMatch);
  });

  it('page', function () {
    assert.deepEqual(Page.fromRaw({ data: 1, before: 2, after: 3 }), new Page(1, 2, 3));
    assert.deepEqual(new Page([1, 2, 3], 2, 3).mapData(function(x) { return x + 1;}), new Page([2, 3, 4], 2, 3));
  });

  it('time conversion', function () {
    var dt = new Date();
    assert.deepEqual(new FaunaTime(dt).date, dt);

    var epoch = new Date(Date.UTC(1970, 0, 1));
    var ft = new FaunaTime(epoch);
    assert.deepEqual(ft, new FaunaTime('1970-01-01T00:00:00.000Z'));
    assert.deepEqual(ft.date, epoch);

    // time offset not allowed
    assert.throws(function () {
      return new FaunaTime('1970-01-01T00:00:00.000+04:00');}, errors.InvalidValue);
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
});
