import Expr from '../Expr'
import arity from './arity'
import { wrap } from './wrap'

/**
 * Returns a time expression's day of the year, from 1 to 365, or 366 in a leap year.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to day of year.
 * @return {Expr}
 */
export default function DayOfYear(expr) {
  arity.exact(1, arguments, DayOfYear.name)
  return new Expr({ day_of_year: wrap(expr) })
}
