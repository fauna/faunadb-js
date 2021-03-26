import Expr from '../Expr'
import arity from './arity'
import { wrap } from './wrap'

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The arc cosine of the number
 * @return {Expr}
 */
export default function Acos(expr) {
  arity.exact(1, arguments, Acos.name)
  return new Expr({ acos: wrap(expr) })
}
