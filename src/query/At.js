import Expr from '../Expr'
import arity from './arity'
import { wrap } from './wrap'

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * @param {module:query~ExprArg} timestamp
 *   An Expr that will evaluate to a Time.
 * @param {module:query~ExprArg} expr
 *   The Expr to run at the given snapshot time.
 * @return {Expr}
 * */
export default function At(timestamp, expr) {
  arity.exact(2, arguments, At.name)
  return new Expr({ at: wrap(timestamp), expr: wrap(expr) })
}
