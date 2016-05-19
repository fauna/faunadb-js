var errors = require('../errors');
var objects = require('../objects');

/**
 * A Codec sits inside a {@link Field} in a {@link Model} and prepares data for database storage.
 *
 * Encoded values must be JSON data: objects, lists, numbers, {@link Ref}s and {@link Set}s.
 *
 * A field without a Codec must store only JSON data.
 *
 * Input data may be sanitized (e.g. RefCodec converts strings to {@link Ref}s),
 * so there is no guarantee that `codec.decode(codec.encode(value)) === value`.
 */
function Codec() { }

/**
 * Converts a value from the database into a more usable object.
 *
 * (The value taken from the database will already have {@link Ref}s and {@link Set}s converted.)
 * @abstract
 */
Codec.prototype.decode = function() {
  throw new errors.Error('Not implemented.');
};

/**
 * Converts a value to prepare for storage in the database.
 * @abstract
 */
Codec.prototype.encode = function() {
  throw new errors.Error('Not implemented.');
};

/**
 * Codec for a field whose value is always a {@link Ref}.
 * Also converts any strings coming in to {@link Ref}s.
 */
function RefCodec() { }

RefCodec.prototype.inspect = function() {
  return 'RefCodec';
};

RefCodec.prototype.decode = function(ref) {
  return ref;
};

RefCodec.prototype.encode = function(value) {
  if (value === null) {
    return null;
  } else if (typeof value === 'string') {
    return new objects.Ref(value);
  } else if (value instanceof Ref) {
    return value;
  } else {
    throw new errors.InvalidValue('Expected a Ref, got: ' + value);
  }
};

module.exports = {
  Codec: Codec,
  RefCodec: RefCodec
};
