import Expr from '../Expr'
import argsToArray from './argsToArray'
import arity from './arity'
import { wrap } from './wrap'

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * @param {...module:query~ExprArg} args
 *   A series of expressions to run.
 * @return {Expr}
 * */
export default function Do() {
  arity.min(1, arguments, Do.name)
  var args = argsToArray(arguments)
  return new Expr({ do: wrap(args) })
}
