'use strict';

var errors = require('./errors');
var Expr = require('./Expr');
var util = require('util');

/**
 * Base type for FaunaDB objects.
 *
 * @extends Expr
 * @constructor
 */
function Value() { }

util.inherits(Value, Expr);

/**
 * FaunaDB ref.
 * See the [docs](https://faunadb.com/documentation/queries#values-special_types).
 *
 * A simple wrapper around a string which can be extracted using `ref.value`.
 * Queries that require a Ref will not work if you just pass in a string.
 *
 * You can create a Ref from a string, such as `new Ref('databases/prydain')`.
 * You can also call `new Ref('databases', 'prydain')` or `new Ref(new Ref('databases'), 'prydain').
 *
 * @param {string|Ref} valueOrParent
 *   The string value of the Ref, or the parent portion of the Ref if child is specified.
 * @param {?string} id
 *   The child portion of the ref.
 *
 * @extends Value
 * @constructor
 */
Value.Ref = function() {
  var parts = Array.prototype.slice.call(arguments);
  /**
   * The string value of the ref.
   *
   * @type {string}
   */
  this.value = parts.join('/');
};

util.inherits(Value.Ref, Value);

/**
 * Gets the class part out of the Ref.
 * This is done by removing the id.
 * So `new Ref('a', 'b/c').class` will be `new Ref('a/b')`.
 *
 * @member {string}
 * @name Value.Ref#class
 */
Object.defineProperty(Value.Ref.prototype, 'class', { get: function() {
  var parts = this.value.split('/');
  if (parts.length === 1) {
    return this;
  } else {
    return new Value.Ref(parts.slice(0, parts.length - 1).join('/'));
  }
} });

/**
 * Removes the class part of the Ref, leaving only the id.
 * this is everything after the last `/`.
 *
 * @member {string}
 * @name Value.Ref#id
 */
Object.defineProperty(Value.Ref.prototype, 'id', { get: function() {
  var parts = this.value.split('/');
  if (parts.length === 1) {
    throw new errors.InvalidValue('The Ref does not have an id.');
  }
  return parts[parts.length - 1];
} });

/** @ignore */
Value.Ref.prototype.toJSON = function() {
  return { '@ref': this.value };
};

/** @ignore */
Value.Ref.prototype.toString = function() {
  return this.value;
};

/** @ignore */
Value.Ref.prototype.valueOf = function() {
  return this.value;
};

/** @ignore */
Value.Ref.prototype.inspect = function() {
  return 'Ref(' + JSON.stringify(this.value) + ')';
};

/**
 * Whether these are both Refs and have the same value.
 * @param {any} other
 * @returns {boolean}
 */
Value.Ref.prototype.equals = function(other) {
  return other instanceof Value.Ref && this.value === other.value;
};

/**
 * FaunaDB Set.
 * This represents a set returned as part of a response.
 * This looks like `{"@set": set_query}`.
 * For query sets see {@link match}, {@link union},
 * {@link intersection}, {@link difference}, and {@link join}.
 *
 * @extends Value
 * @constructor
 */
Value.SetRef = function(value) {
  /** Raw query object. */
  this.value = value;
};

util.inherits(Value.SetRef, Value);

/** @ignore */
Value.SetRef.prototype.inspect = function() {
  return 'SetRef(' + JSON.stringify(this.value) + ')';
};

/** @ignore */
Value.SetRef.prototype.toJSON = function() {
  return { '@set': this.value };
};

/** FaunaDB time. See the [docs](https://faunadb.com/documentation/queries#values-special_types).
 *
 * @param {string|Date} value If a Date, this is converted to a string.
 * @extends Value
 * @constructor
 */
Value.FaunaTime = function(value) {
  if (value instanceof Date) {
    value = value.toISOString();
  } else if (!(value.charAt(value.length - 1) === 'Z')) {
    throw new errors.InvalidValue('Only allowed timezone is \'Z\', got: ' + value);
  }

  this.value = value;
};

util.inherits(Value.FaunaTime, Value);

/**
 * Returns the date wrapped by this object.
 * This is lossy as Dates have millisecond rather than nanosecond precision.
 *
 * @member {Date}
 * @name Value.FaunaTime#date
 */
Object.defineProperty(Value.FaunaTime.prototype, 'date', { get: function() {
  return new Date(this.value);
} });

/** @ignore */
Value.FaunaTime.prototype.toJSON = function() {
  return { '@ts': this.value };
};

/** FaunaDB date. See the [docs](https://faunadb.com/documentation/queries#values-special_types).
 *
 * @param {string|Date} value
 *   If a Date, this is converted to a string, with time-of-day discarded.
 * @extends Value
 * @constructor
 */
Value.FaunaDate = function(value) {
  if (value instanceof Date) {
    // The first 10 characters 'YYYY-MM-DD' are the date portion.
    value = value.toISOString().slice(0, 10);
  }

  /**
   * ISO8601 date.
   * @type {string}
   */
  this.value = value;
};

util.inherits(Value.FaunaDate, Value);

/**
 * @member {Date}
 * @name Value.FaunaDate#date
 */
Object.defineProperty(Value.FaunaDate.prototype, 'date', { get: function() {
  return new Date(this.value);
} });

/** @ignore */
Value.FaunaDate.prototype.toJSON = function()  {
  return { '@date': this.value };
};

module.exports = Value;
