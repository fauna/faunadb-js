'use strict';

function describeIf(name, condition, handler) {
  if (condition) return describe(name, handler);
  return describe.skip(name, handler);
}

var EVIL = 'eval';

function supportsArrow() {
  try {
    var fn = global[EVIL]('(x => 3)');
    return typeof fn === 'function';
  } catch (ex) {
    return false;
  }
}

function supportsGenerator() {
  try {
    var fn = global[EVIL]('(function *() { yield 3; })');
    return typeof fn === 'function';
  } catch (ex) {
    return false;
  }
}

function supportsObject() {
  try {
    var fn = global[EVIL]('({xyz(){}}).xyz');
    return typeof fn === 'function';
  } catch (ex) {
    return false;
  }
}

function supportsDestructuring() {
  try {
    var fn = global[EVIL]('(({x}) => x)');
    return typeof fn === 'function';
  } catch (ex) {
    return false;
  }
}

require('./function');

if (supportsArrow()) {
  require('./arrow');
}

if(supportsGenerator()) {
  require('./generator');
}

if (supportsObject()) {
  require('./object');
}

if (supportsDestructuring()) {
  require('./destructuring');
}
