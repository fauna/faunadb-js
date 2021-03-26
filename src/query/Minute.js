import Expr from '../Expr'
import arity from './arity'
import { wrap } from './wrap'

/**
 * Returns a time expression's second of the minute, from 0 to 59.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to a month.
 * @return {Expr}
 */
export default function Minute(expr) {
  arity.exact(1, arguments, Minute.name)
  return new Expr({ minute: wrap(expr) })
}
