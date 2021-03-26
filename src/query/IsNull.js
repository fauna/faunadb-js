import Expr from '../Expr'
import arity from './arity'
import { wrap } from './wrap'

/**
 * Check if the expression is null.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/isnull">IsNull</a>
 */
export default function IsNull(expr) {
  arity.exact(1, arguments, IsNull.name)
  return new Expr({ is_null: wrap(expr) })
}
