'use strict';

// TODO: link to query docs here?
/**
 * A representation of a FaunaDB Query Expression. Generally, you shouldn't need
 * to use this class directly; use the Query helpers instead.
 * @param {Object} obj The object that represents a Query to be treated as an Expression.
 * @constructor
 */
function Expr(obj) {
  this.raw = obj;
}

/**
 * Wraps an object as an Expression. This will automatically wrap any bare objects with
 * the appropriate {@link object} escaping.
 * @param {Object} obj
 *  The object to be wrapped as an Expression.
 * @returns {Expr}
 *   The expression wrapping the provided object.
 */
Expr.wrap = function(obj) {
  if (obj === null) {
    return null;
  } if (obj instanceof Expr) {
    return obj;
  } else if (obj instanceof Array) {
    return new Expr(obj.map(function (elem) {
      return Expr.wrap(elem);
    }));
  } else if (typeof obj === 'object') {
    return new Expr({ object: Expr.wrapValues(obj) });
  } else {
    return obj;
  }
};

/**
 * Wraps all of the values of a provided Object, while leaving the parent object unwrapped.
 * @param {Object} obj
 *  The object whose values are to be wrapped as Expressions.
 * @returns {Object}
 *  A copy of the provided object, with the values wrapped as Expressions.
 */
Expr.wrapValues = function(obj) {
  if (obj !== null) {
    var rv = {};

    Object.keys(obj).forEach(function(key) {
      rv[key] = Expr.wrap(obj[key]);
    });

    return rv;
  } else {
    return null;
  }
};

Expr.prototype.toJSON = function() {
  return this.raw;
};

module.exports = Expr;