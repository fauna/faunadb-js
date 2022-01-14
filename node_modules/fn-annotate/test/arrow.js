'use strict';

var expect = require('expect');
var annotate = require('../');

describe('annotate(arrowFunction)', function () {
  it('should parse an argument without parenthesis', function () {
    expect(annotate(x => x)).toEqual(['x']);
  });
  it('should parse arguments with parenthesis', function () {
    var fn =  (xy, z) => z;
    expect(annotate(fn)).toEqual(['xy', 'z']);
  });
  it('should parse functions with blocks', function () {
    var fn =  (xy, z) => { return z; };
    expect(annotate(fn)).toEqual(['xy', 'z']);
  });
  it('should parse an argument without parenthesis, but with a block', function () {
    var fn = xyz => { return xyz; };
    expect(annotate(fn)).toEqual(['xyz']);
  });
  it('should parse an argument without parenthesis, but with a block, with a function call', function () {
    var fn = xyz => { return e(); };
    expect(annotate(fn)).toEqual(['xyz']);
  });
  it('should parse functions without spacing', function () {
    var fn = x=>x;
    expect(annotate(fn)).toEqual(['x']);
  });
  it('should parse getters', function () {
    var fn = ()=>null;
    expect(annotate(fn)).toEqual([]);
  });
  it('should ignore comments', function () {
    var fn = (
      // This is a test
      x
    ) => null;
    expect(annotate(fn)).toEqual(['x']);
  });
  it('should ignore multiline comments', function () {
    var fn = (/* testing a,b,c */) => null;
    expect(annotate(fn)).toEqual([]);
  });
  it('should work with commas before multiline comments', function () {
    var fn = (x, /* testing a,b,c */y, z) => null;
    expect(annotate(fn)).toEqual(['x', 'y', 'z'])
  });
  it('should work with commas after multiline comments', function () {
    var fn = (x/* testing a,b,c */,y, z) => null;
    expect(annotate(fn)).toEqual(['x', 'y', 'z']);
  });
});
