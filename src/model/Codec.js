import {InvalidValue} from '../errors'
import {Ref} from '../objects'

/**
 * A Codec sits inside a field in a {@link Model} and prepares data for database storage.
 *
 * Encoded values must be JSON data: objects, lists, numbers, {@link Ref}s and {@link Set}s.
 *
 * A field without a Codec must store only JSON data.
 *
 * {@link Model} instances cache the results of conversions.
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
 * Uses a `Ref` as the decoded value and `{"@ref": string}` JSON as the encoded value.
 *
 * If the ref is invalid, `NotFound` will be thrown.
 */
export class RefCodec extends Codec {
  constructor(referencedModelClass) {
    super()
    this.referencedModelClass = referencedModelClass
  }

  /** Takes the {@link Ref] of a {@link Model}. */
  encode(value) {
    if (value === null)
      return null
     else if (value instanceof Ref)
      return value
    else {
      // value should be a Model
      if (value.isNewInstance())
        throw new InvalidValue('The referenced instance must be saved to the database first.')
      if (!(value instanceof this.referencedModelClass))
        throw new InvalidValue(
          `The reference should be a ${this.referencedModelClass}; got a ${value.constructor}.`)
      return value.ref
    }
  }

  /** Fetches the data for a {@link Ref} and creates a {@link Model}. */
  async decode(raw, model) {
    return raw === null ? null : await this.referencedModelClass.get(model.client, raw)
  }
}
