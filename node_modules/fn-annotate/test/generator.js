'use strict';

var expect = require('expect');
var annotate = require('../');

describe('annotate(generatorFunction)', function () {
  it('should parse no argument function correctly', function () {
    var gen = function *() {};
    expect(annotate(gen)).toEqual([]);
  });
  it('should parse no argument function correctly with spacing on the right', function () {
    var gen = function* () {};
    expect(annotate(gen)).toEqual([]);
  });
  it('should parse no argument function correctly with no spacing', function () {
    var gen = function*() {};
    expect(annotate(gen)).toEqual([]);
  });
  it('should parse arguments', function () {
    var gen = function * (x, y, xyz) {};
    expect(annotate(gen)).toEqual(['x', 'y', 'xyz']);
  });
});
