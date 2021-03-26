import Expr from '../Expr'
import arity from './arity'
import { wrap } from './wrap'

/**
 * Check if the expression is a reference.
 *
 * @param {module:query~ExprArg} expr
 *   The expression to check
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/isref">IsRef</a>
 */
export default function IsRef(expr) {
  arity.exact(1, arguments, IsRef.name)
  return new Expr({ is_ref: wrap(expr) })
}
