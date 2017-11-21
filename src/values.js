'use strict';

var base64 = require('base64-js');
var errors = require('./errors');
var Expr = require('./Expr');
var util = require('util');

/**
 * FaunaDB value types. Generally, these classes do not need to be instantiated
 * directly; they can be constructed through helper methods in {@link module:query}.
 *
 * Instances of these classes will be returned in responses if the response object
 * contains these values. For example, a FaunaDB response containing
 *`{ "@ref": { "id": "123", "class": { "@ref": { "id": "frogs", "class": { "@ref": { "id": "classes" } } } } } }
 * will be returned as `new values.Ref("123", new values.Ref("frogs", values.Native.CLASSES))`.
 *
 * See the [FaunaDB Query API Documentation](https://fauna.com/documentation/queries#values)
 * for more information.
 *
 * @module values
 */

/**
 * Base type for FaunaDB value objects.
 *
 * @extends Expr
 * @abstract
 * @constructor
 */
function Value() { }

util.inherits(Value, Expr);

/**
 * FaunaDB ref.
 * See the [docs](https://fauna.com/documentation/queries#values-special_types).
 *
 * @param {string} id
 *   The id portion of the ref.
 * @param {Ref} [clazz]
 *   The class portion of the ref.
 * @param {Ref} [database]
 *   The database portion of the ref.
 *
 * @extends module:values~Value
 * @constructor
 */
function Ref(id, clazz, database) {
  if (!id) throw new errors.InvalidValue('id cannot be null or undefined');

  this.value = { id: id };
  if (clazz) this.value['class'] = clazz;
  if (database) this.value['database'] = database;
}

util.inherits(Ref, Value);

/**
 * Gets the class part out of the Ref.
 *
 * @member {string}
 * @name module:values~Ref#class
 */
Object.defineProperty(Ref.prototype, 'class', { get: function() {
  return this.value['class'];
} });

/**
 * Gets the database part out of the Ref.
 *
 * @member {Ref}
 * @name module:values~Ref#database
 */
Object.defineProperty(Ref.prototype, 'database', { get: function() {
  return this.value['database'];
} });

/**
 * Gets the id part out of the Ref.
 *
 * @member {Ref}
 * @name module:values~Ref#id
 */
Object.defineProperty(Ref.prototype, 'id', { get: function() {
  return this.value['id'];
} });

/** @ignore */
Ref.prototype.toJSON = function() {
  return { '@ref': this.value };
};

/** @ignore */
Ref.prototype.toString = function() {
  var cls = this.class !== undefined ? ', class=' + this.class.toString() : '';
  var db = this.database !== undefined ? ' database=' +  this.database.toString() : '';
  return 'Ref(id=' + this.id + cls + db + ')';
};

/** @ignore */
Ref.prototype.valueOf = function() {
  return this.value;
};

/** @ignore */
Ref.prototype.inspect = function() {
  var cls = this.class !== undefined ? ', class=' + this.class.inspect() : '';
  var db = this.database !== undefined ? ', database=' +  this.database.inspect() : '';
  return 'Ref(id=' + this.id + cls + db + ')';
};

/**
 * Whether these are both Refs and have the same value.
 * @param {any} other
 * @returns {boolean}
 */
Ref.prototype.equals = function(other) {
  return other instanceof Ref && this.value === other.value;
};

var Native = {
  CLASSES: new Ref('classes'),
  INDEXES: new Ref('indexes'),
  DATABASES: new Ref('databases'),
  FUNCTIONS: new Ref('functions'),
  KEYS: new Ref('keys')
};

Native.fromName = function(name) {
  switch(name) {
    case 'classes': return Native.CLASSES;
    case 'indexes': return Native.INDEXES;
    case 'databases': return Native.DATABASES;
    case 'functions': return Native.FUNCTIONS;
    case 'keys': return Native.KEYS;
  }
  return new Ref(name);
};

/**
 * FaunaDB Set.
 * This represents a set returned as part of a response.
 * This looks like `{"@set": set_query}`.
 * For query sets see {@link match}, {@link union},
 * {@link intersection}, {@link difference}, and {@link join}.
 *
 * @extends module:values~Value
 * @constructor
 */
function SetRef(value) {
  /** Raw query object. */
  this.value = value;
}

util.inherits(SetRef, Value);

/** @ignore */
SetRef.prototype.inspect = function() {
  return 'SetRef(' + JSON.stringify(this.value) + ')';
};

/** @ignore */
SetRef.prototype.toJSON = function() {
  return { '@set': this.value };
};

/** FaunaDB time. See the [docs](https://fauna.com/documentation/queries#values-special_types).
 *
 * @param {string|Date} value If a Date, this is converted to a string.
 * @extends module:values~Value
 * @constructor
 */
function FaunaTime(value) {
  if (value instanceof Date) {
    value = value.toISOString();
  } else if (!(value.charAt(value.length - 1) === 'Z')) {
    throw new errors.InvalidValue('Only allowed timezone is \'Z\', got: ' + value);
  }

  this.value = value;
}

util.inherits(FaunaTime, Value);

/**
 * Returns the date wrapped by this object.
 * This is lossy as Dates have millisecond rather than nanosecond precision.
 *
 * @member {Date}
 * @name module:values~FaunaTime#date
 */
Object.defineProperty(FaunaTime.prototype, 'date', { get: function() {
  return new Date(this.value);
} });

/** @ignore */
FaunaTime.prototype.toJSON = function() {
  return { '@ts': this.value };
};

/** FaunaDB date. See the [docs](https://fauna.com/documentation/queries#values-special_types).
 *
 * @param {string|Date} value
 *   If a Date, this is converted to a string, with time-of-day discarded.
 * @extends module:values~Value
 * @constructor
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

util.inherits(FaunaDate, Value);

/**
 * @member {Date}
 * @name module:values~FaunaDate#date
 */
Object.defineProperty(FaunaDate.prototype, 'date', { get: function() {
  return new Date(this.value);
} });

/** @ignore */
FaunaDate.prototype.toJSON = function()  {
  return { '@date': this.value };
};

/** FaunaDB bytes. See the [docs](https://fauna.com/documentation/queries#values-special_types).
 *
 * @param {Uint8Array|ArrayBuffer|string} value
 *    If ArrayBuffer it's converted to Uint8Array
 *    If string it must be base64 encoded and it's converted to Uint8Array
 * @extends module:values~Value
 * @constructor
 */
function Bytes(value) {
  if (value instanceof ArrayBuffer) {
    this.value = new Uint8Array(value);
  } else if (typeof value === 'string') {
    this.value = base64.toByteArray(value);
  } else if (value instanceof Uint8Array) {
    this.value = value;
  } else {
    throw new errors.InvalidValue('Bytes type expect argument to be either Uint8Array|ArrayBuffer|string, got: ' + JSON.stringify(value));
  }
}

util.inherits(Bytes, Value);

/** @ignore */
Bytes.prototype.inspect = function() {
  return 'Bytes("' + base64.fromByteArray(this.value) + '")';
};

/** @ignore */
Bytes.prototype.toJSON = function()  {
  return { '@bytes': base64.fromByteArray(this.value) };
};

/** FaunaDB query. See the [docs](https://fauna.com/documentation/queries#values-special_types).
 *
 * @param {any} value
 * @extends module:values~Value
 * @constructor
 */
function Query(value) {
  this.value = value;
}

util.inherits(Query, Value);

/** @ignore */
Query.prototype.inspect = function() {
  return 'Query("' + this.value + '")';
};

/** @ignore */
Query.prototype.toJSON = function()  {
  return { '@query': this.value };
};

module.exports = {
  Value: Value,
  Ref: Ref,
  Native: Native,
  SetRef: SetRef,
  FaunaTime: FaunaTime,
  FaunaDate: FaunaDate,
  Bytes: Bytes,
  Query: Query
};
