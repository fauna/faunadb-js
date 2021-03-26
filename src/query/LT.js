import Expr from '../Expr'
import arity from './arity'
import varargs from './varargs'
import { wrap } from './wrap'

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#logical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of terms to compare.
 * @return {Expr}
 */
export default function LT() {
  arity.min(1, arguments, LT.name)
  return new Expr({ lt: wrap(varargs(arguments)) })
}
