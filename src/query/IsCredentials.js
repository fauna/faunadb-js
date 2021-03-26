import Expr from '../Expr'
import arity from './arity'
import { wrap } from './wrap'

/**
 * Check if the expression is credentials.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/iscredentials">IsCredentials</a>
 */
export default function IsCredentials(expr) {
  arity.exact(1, arguments, IsCredentials.name)
  return new Expr({ is_credentials: wrap(expr) })
}
