import Expr from '../Expr'
import { Bytes } from '../values'
import { checkInstanceHasProperty } from '../_util'
import arity from './arity'
import Lambda from './Lambda'

/**
 * Wraps an object as an Expression. This will automatically wrap any bare objects with
 * the appropriate {@link object} escaping.
 * @param {Object} obj
 *  The object to be wrapped as an Expression.
 * @returns {Expr}
 *   The expression wrapping the provided object.
 * @private
 */
export function wrap(obj) {
  arity.exact(1, arguments, wrap.name)
  if (obj === null) {
    return null
  } else if (
    obj instanceof Expr ||
    checkInstanceHasProperty(obj, '_isFaunaExpr')
  ) {
    return obj
  } else if (typeof obj === 'symbol') {
    return obj.toString().replace(/Symbol\((.*)\)/, function(str, symbol) {
      return symbol
    })
  } else if (typeof obj === 'function') {
    return Lambda(obj)
  } else if (Array.isArray(obj)) {
    return new Expr(
      obj.map(function(elem) {
        return wrap(elem)
      })
    )
  } else if (obj instanceof Uint8Array || obj instanceof ArrayBuffer) {
    return new Bytes(obj)
  } else if (typeof obj === 'object') {
    return new Expr({ object: wrapValues(obj) })
  } else {
    return obj
  }
}

/**
 * Wraps all of the values of a provided Object, while leaving the parent object unwrapped.
 * @param {Object} obj
 *  The object whose values are to be wrapped as Expressions.
 * @returns {Object}
 *  A copy of the provided object, with the values wrapped as Expressions.
 * @private
 */
export function wrapValues(obj) {
  if (obj !== null) {
    var rv = {}

    Object.keys(obj).forEach(function(key) {
      rv[key] = wrap(obj[key])
    })

    return rv
  } else {
    return null
  }
}
