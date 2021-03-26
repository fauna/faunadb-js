import Expr from '../Expr'
import arity from './arity'
import varargs from './varargs'
import { wrap } from './wrap'

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of expressions to check for equivalence.
 * @return {Expr}
 */
export default function Equals() {
  arity.min(1, arguments, Equals.name)
  return new Expr({ equals: wrap(varargs(arguments)) })
}
