import Expr from '../Expr'
import arity from './arity'
import { wrap } from './wrap'

/**
 * Returns a time expression's day of the month, from 1 to 31.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to day of month.
 * @return {Expr}
 */
export default function DayOfMonth(expr) {
  arity.exact(1, arguments, DayOfMonth.name)
  return new Expr({ day_of_month: wrap(expr) })
}
