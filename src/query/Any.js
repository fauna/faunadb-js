import Expr from '../Expr'
import arity from './arity'
import { wrap } from './wrap'

/**
 *
 * Evaluates to true if any element of the collection is true.
 *
 * @param {array} - collection the collection
 * @return {Expr}
 * @see <a href="https://docs.fauna.com/fauna/current/api/fql/functions/any">Any function</a>
 */
export default function Any(collection) {
  arity.exact(1, arguments, Any.name)
  return new Expr({ any: wrap(collection) })
}
