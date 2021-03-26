import Expr from '../Expr'
import arity from './arity'
import { wrap } from './wrap'

/**
 * Check if the expression is a byte array.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/isbytes">IsBytes</a>
 */
export default function IsBytes(expr) {
  arity.exact(1, arguments, IsBytes.name)
  return new Expr({ is_bytes: wrap(expr) })
}
