import {InvalidValue} from '../errors'
import {Ref} from '../objects'

/**
A Codec sits inside a [[Field]] in a [[Model]] and prepares data for database storage.

Encoded values must be JSON data: objects, lists, numbers, [[Ref]]s and [[Set]]s.

A field without a Codec must store only JSON data.

Input data may be sanitized (e.g. RefCodec converts strings to [[Ref]]s),
so there is no guarantee that `codec.decode(codec.encode(value)) === value`.
*/
export interface Codec<A> {
  /**
  Converts a value from the database into a more usable object.

  (The value taken from the database will already have [[Ref]]s and [[Set]]s converted.)
   @abstract
  */
  decode(raw: any): A
  /**
  Converts a value to prepare for storage in the database.
   @abstract
  */
  encode(value: A): any

  inspect?(): string
}

/**
Codec for a field whose value is always a [[Ref]].
Also converts any strings coming in to [[Ref]]s.
*/
export const RefCodec: Codec<Ref | string> = {
  decode(ref: any): Ref {
    return ref
  },

  encode(value: Ref | string): Ref {
    if (value === null)
      return null
    else if (typeof value === 'string')
      return new Ref(value)
    else if (value instanceof Ref)
      return value
    else
      throw new InvalidValue(`Expected a Ref, got: ${value}`)
  },

  inspect(): string { return 'RefCodec' }
}
