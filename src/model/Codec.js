import {InvalidValue} from '../errors'
import {Ref} from '../objects'

/**
 * A Codec sits inside a field in a {@link Model} and prepares data for database storage.
 *
 * Encoded values must be JSON data: objects, lists, numbers, {@link Ref}s and {@link Set}s.
 *
 * A field without a Codec must store only JSON data.
 *
 * Input data may be sanitized (e.g. RefCodec converts strings to {@link Ref}s),
 * so there is no guarantee that `codec.decode(codec.encode(value)) === value`.
 *
 * {@link Model} instances cache the results of decoding.
 */
export default class Codec {
  /**
   * Converts a value from the database into a more usable object.
   *
   * (The value taken from the database will already have {@link Ref}s and {@link Set}s converted.)
   * @abstract
   */
  decode() { throw new Error('Not implemented.') }
  /**
   * Converts a value to prepare for storage in the database.
   * @abstract
   */
  encode() { throw new Error('Not implemented.') }
}

/**
 * Codec for a field whose value is always a {@link Ref}.
 * Also converts any strings coming in to {@link Ref}s.
 */
export const RefCodec = {
  inspect() { return "RefCodec" },

  decode(ref) {
    return ref
  },

  encode(value) {
    if (value === null)
      return null
    else if (typeof value === 'string')
      return new Ref(value)
    else if (value instanceof Ref)
      return value
    else
      throw new InvalidValue(`Expected a Ref, got: ${value}`)
  }
}
