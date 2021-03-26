import Expr from '../Expr'
import arity from './arity'
import { wrap } from './wrap'

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The square root of the number
 * @return {Expr}
 */
export default function Sqrt(expr) {
  arity.exact(1, arguments, Sqrt.name)
  return new Expr({ sqrt: wrap(expr) })
}
