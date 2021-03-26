import Expr from '../Expr'
import arity from './arity'
import { wrap } from './wrap'

/**
 * Check if the expression is a double.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/isdouble">IsDouble</a>
 */
export default function IsDouble(expr) {
  arity.exact(1, arguments, IsDouble.name)
  return new Expr({ is_double: wrap(expr) })
}
