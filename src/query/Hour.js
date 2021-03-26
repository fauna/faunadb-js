import Expr from '../Expr'
import arity from './arity'
import { wrap } from './wrap'

/**
 * Returns a time expression's second of the minute, from 0 to 59.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to a hour.
 * @return {Expr}
 */
export default function Hour(expr) {
  arity.exact(1, arguments, Hour.name)
  return new Expr({ hour: wrap(expr) })
}
