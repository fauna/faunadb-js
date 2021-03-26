import Expr from '../Expr'
import arity from './arity'
import { wrap } from './wrap'
import varargs from './varargs'

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of numbers to multiply together.
 * @return {Expr}
 */
export default function Min() {
  arity.min(1, arguments, Min.name)
  return new Expr({ min: wrap(varargs(arguments)) })
}
