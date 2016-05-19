'use strict';

var errors = require('./errors');

/**
 * FaunaDB ref.
 * See the [docs](https://faunadb.com/documentation/queries#values-special_types).
 *
 * A simple wrapper around a string which can be extracted using `ref.value`.
 * Queries that require a Ref will not work if you just pass in a string.
 */
function Ref() {
  // TODO: Constructor documentation
  /**
   * Create a Ref from a string, such as `new Ref('databases/prydain')`.
   * Can also call `new Ref('databases', 'prydain')` or `new Ref(new Ref('databases'), 'prydain').
   */
  var parts = Array.prototype.slice.call(arguments);
  this.value = parts.join('/');
}

/**
 * Gets the class part out of the Ref.
 * This is done by removing the id.
 * So `new Ref('a', 'b/c').class` will be `new Ref('a/b')`.
 */
Ref.prototype.class = function() {
  var parts = this.value.split('/');
  if (parts.length === 1) {
    return this;
  } else {
    return new Ref(parts.slice(0, parts.length - 1).join('/'));
  }
};

/**
 * Removes the class part of the Ref, leaving only the id.
 * this is everything after the last `/`.
 */
Ref.prototype.id = function() {
  var parts = this.value.split('/');
  if (parts.length === 1) {
    throw new errors.InvalidValue('The Ref does not have an id.');
  }
  return parts[parts.length - 1];
};

/** @ignore */
Ref.prototype.toJSON = function() {
  return { '@ref': this.value };
};

/** @ignore */
Ref.prototype.toString = function() {
  return this.value;
};

/** @ignore */
Ref.prototype.valueOf = function() {
  return this.value;
};

/** @ignore */
Ref.prototype.inspect = function() {
  return 'Ref(' + JSON.stringify(this.value) + ')';
};

/** Whether these are both Refs and have the same value. */
Ref.prototype.equals = function(other) {
  return other instanceof Ref && this.value === other.value;
};

/**
 * FaunaDB Set.
 * This represents a set returned as part of a response.
 * This looks like This looks like `{"@set": set_query}`.
 * For query sets see {@link match}, {@link union},
 * {@link intersection}, {@link difference}, and {@link join}.
 */
function SetRef(query) {
  /** Raw query object. */
  this.query = query;
}

/** @ignore */
SetRef.prototype.inspect = function() {
  return 'SetRef(' + JSON.stringify(this.value) + ')';
};

/** @ignore */
SetRef.prototype.toJSON = function() {
  return { '@set': this.query };
};

/**
 * A single pagination result.
 * See `paginate` in the [docs](https://faunadb.com/documentation/queries#read_functions).
 */
function Page(data, before, after) {
  /**
   * Always a list.
   * Elements could be raw data; some methods may convert data.
   */
  this.data = data;
  /** Optional {@link Ref} for an instance that comes before this page. */
  this.before = before;
  /** Optional {@link Ref} for an instance that comes after this page. */
  this.after = after;
}

/** Use this on an object that you know represents a Page. */
Page.fromRaw = function(object) {
  return new Page(object.data, object.before, object.after);
};

Page.prototype.mapData = function(func) {
  return new Page(this.data.map(func), this.before, this.after);
};

/** FaunaDB time. See the [docs](https://faunadb.com/documentation/queries#values-special_types). */
/**
 * @param {string|Date} value If a Date, this is converted to a string.
 */
function FaunaTime(value) {
  if (value instanceof Date) {
    value = value.toISOString();
  } else if (!value.endsWith('Z')) {
    throw new errors.InvalidValue('Only allowed timezone is \'Z\', got: ' + value);
  }
  
  this.value = value;
}

/**
 * This is lossy as Dates have millisecond rather than nanosecond precision.
 * @return {Date}
 */
FaunaTime.prototype.date = function() {
  return new Date(this.value);
};

/** @ignore */
FaunaTime.prototype.toJSON = function() {
  return { '@ts': this.value };
};

/** FaunaDB date. See the [docs](https://faunadb.com/documentation/queries#values-special_types). */
  /**
   * @param {string|Date} value
   *   If a Date, this is converted to a string, with time-of-day discarded.
   */
function FaunaDate(value) {
  if (value instanceof Date) {
    // The first 10 characters 'YYYY-MM-DD' are the date portion.
    value = value.toISOString().slice(0, 10);
  }

  /**
   * ISO8601 date.
   * @type {string}
   */
  this.value = value;
}

/** @return {Date} */
FaunaDate.prototype.date = function() {
  return new Date(this.value);
};

/** @ignore */
FaunaDate.prototype.toJSON = function()  {
  return { '@date': this.value };
};

module.exports = {
  Ref: Ref,
  SetRef: SetRef,
  Page: Page,
  FaunaTime: FaunaTime,
  FaunaDate: FaunaDate
};
