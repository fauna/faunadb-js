'use strict';

var base64 = require('base64-js');
var errors = require('./errors');
var Expr = require('./Expr');
var util = require('util');

var customInspect = util && util.inspect && util.inspect.custom;
var stringify = (util && util.inspect) || JSON.stringify;

/**
 * FaunaDB value types. Generally, these classes do not need to be instantiated
 * directly; they can be constructed through helper methods in {@link module:query}.
 *
 * Instances of these classes will be returned in responses if the response object
 * contains these values. For example, a FaunaDB response containing
 *`{ "@ref": { "id": "123", "class": { "@ref": { "id": "frogs", "class": { "@ref": { "id": "classes" } } } } } }`
 * will be returned as `new values.Ref("123", new values.Ref("frogs", values.Native.CLASSES))`.
 *
 * See the [FaunaDB Query API Documentation](https://app.fauna.com/documentation/reference/queryapi#simple-type)
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
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#special-type).
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

wrapToString(Ref, function() {
  var constructors = {
    classes: "Class",
    databases: "Database",
    indexes: "Index",
    functions: "Function"
  };

  var toString = function(ref, prevDb) {
    if (ref.class === undefined && ref.database === undefined)
      return ref.id.charAt(0).toUpperCase() + ref.id.slice(1) + '(' + prevDb + ')';

    var constructor = constructors[ref.class.id];
    if (constructor !== undefined) {
      var db = ref.database !== undefined ? ', ' +  ref.database.toString() : '';
      return constructor + '("' + ref.id + '"' + db + ')';
    }

    var db = ref.database !== undefined ? ref.database.toString() : '';

    return 'Ref(' + toString(ref.class, db) + ', "' + ref.id + '")';
  };

  return toString(this, '');
});

/** @ignore */
Ref.prototype.valueOf = function() {
  return this.value;
};

/**
 * Whether these are both Refs and have the same value.
 * @param {any} other
 * @returns {boolean}
 */
Ref.prototype.equals = function(other) {
  return (other instanceof Ref) &&
    this.id === other.id &&
    ((this.class === undefined && other.class === undefined) ||
      this.class.equals(other.class)) &&
    ((this.database === undefined && other.database === undefined) ||
      this.database.equals(other.database))
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

wrapToString(SetRef, function() {
  return 'SetRef(' + stringify(this.value) + ')';
});

/** @ignore */
SetRef.prototype.toJSON = function() {
  return { '@set': this.value };
};

/** FaunaDB time. See the [docs](https://app.fauna.com/documentation/reference/queryapi#special-type).
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

wrapToString(FaunaTime, function() {
  return 'Time("' + this.value + '")';
});

/** @ignore */
FaunaTime.prototype.toJSON = function() {
  return { '@ts': this.value };
};

/** FaunaDB date. See the [docs](https://app.fauna.com/documentation/reference/queryapi#special-type).
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

wrapToString(FaunaDate, function() {
  return 'Date("' + this.value + '")';
});

/** @ignore */
FaunaDate.prototype.toJSON = function()  {
  return { '@date': this.value };
};

/** FaunaDB bytes. See the [docs](https://app.fauna.com/documentation/reference/queryapi#special-type).
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
    throw new errors.InvalidValue('Bytes type expect argument to be either Uint8Array|ArrayBuffer|string, got: ' + stringify(value));
  }
}

util.inherits(Bytes, Value);

wrapToString(Bytes, function() {
  return 'Bytes("' + base64.fromByteArray(this.value) + '")';
});

/** @ignore */
Bytes.prototype.toJSON = function()  {
  return { '@bytes': base64.fromByteArray(this.value) };
};

/** FaunaDB query. See the [docs](https://app.fauna.com/documentation/reference/queryapi#special-type).
 *
 * @param {any} value
 * @extends module:values~Value
 * @constructor
 */
function Query(value) {
  this.value = value;
}

util.inherits(Query, Value);

wrapToString(Query, function() {
  return 'Query(' + Expr.toString(this.value) + ')';
});

/** @ignore */
Query.prototype.toJSON = function()  {
  return { '@query': this.value };
};

/** @ignore */
function wrapToString(type, fn) {
  type.prototype.toString = fn;
  type.prototype.inspect = fn;

  if (customInspect) {
    type.prototype[customInspect] = fn;
  }
}

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
