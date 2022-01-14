'use strict';

var expect = require('expect');
var annotate = require('../');

describe('annotate(objectFunction)', function () {
  it('should parse no argument function correctly', function () {
    var obj = {fn() {}}
    expect(annotate(obj.fn)).toEqual([]);
  });
  it('should parse no argument function correctly with spacing on the right', function () {
    var obj = {fn () {}}
    expect(annotate(obj.fn)).toEqual([]);
  });
  it('should parse no argument function correctly with no spacing', function () {
    var obj = {fn(){}}
    expect(annotate(obj.fn)).toEqual([]);
  });
  it('should parse arguments', function () {
    var obj = {fn(x, y, xyz){}}
    expect(annotate(obj.fn)).toEqual(['x', 'y', 'xyz']);
  });
});
