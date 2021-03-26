import Expr from '../Expr'
import arity from './arity'
import { wrap } from './wrap'

/**
 * Check if the expression is an array.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/isarray">IsArray</a>
 */
export default function IsArray(expr) {
  arity.exact(1, arguments, IsArray.name)
  return new Expr({ is_array: wrap(expr) })
}
