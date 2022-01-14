'use strict';

var expect = require('expect');
var annotate = require('../');

describe('annotate(destructuring)', function () {
  it('should parse a single object argument with one key', function () {
    expect(annotate(function ({x}) {})).toEqual([['x']]);
  });
  it('should parse a single object argument with two keys', function () {
    expect(annotate(function ({x, y}) {})).toEqual([['x', 'y']]);
  });
  it('should parse three object arguments with multiple keys', function () {
    expect(annotate(function ({a, b}, example, {x, y}, {z}) {})).toEqual([['a', 'b'], 'example', ['x', 'y'], ['z']]);
  });
  it('should parse three object arguments with multiple keys for arrow functions', function () {
    expect(annotate(({a, b}, example, {x, y}, {z}) => 3)).toEqual([['a', 'b'], 'example', ['x', 'y'], ['z']]);
  });
  it('should parse destructured arrays', function () {
    expect(annotate(function ([row1, row2]) {})).toEqual([{items: ['row1', 'row2']}]);
  });
  it('should parse destructured arrays alongside destructured objects', function () {
    expect(annotate(function ([row1, row2], {a, b}, example, {x, y}) {})).toEqual([{items: ['row1', 'row2']}, ['a', 'b'], 'example', ['x', 'y']]);
  });
});
