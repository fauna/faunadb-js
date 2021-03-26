import Expr from '../Expr'
import arity from './arity'
import varargs from './varargs'
import { wrap } from './wrap'

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of numbers to multiply together.
 * @return {Expr}
 */
export default function Max() {
  arity.min(1, arguments, Max.name)
  return new Expr({ max: wrap(varargs(arguments)) })
}
