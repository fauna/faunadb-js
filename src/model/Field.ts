import {applyDefaults} from '../_util'
import {Codec} from './Codec'

export type FieldOptions<A> = {
  codec?: Codec<A>,
  path?: Array<string>
}

/** Stores information about a field in a [[Model]]. */
export default class Field<A> {
  /**
  When you get this field, this translates a raw value to the field's type.
  When you set this field, this translates it to a raw value.
  */
  codec: Codec<A>
  /**
  Path to the field's raw value.
  By default, for a field `x` this will be `['data', 'x']`.
  */
  path: Array<string>

  /**
  You don't need to call this directly;
  this is called for you by [[Model#setup]] and [[Model#addField]].
  */
  constructor(opts: FieldOptions<A>) {
    Object.assign(this, applyDefaults(opts, {
      codec: null,
      path: null
    }))
  }
}
// KLUDGE - fixed in typescript 1.8
exports.default = Field
