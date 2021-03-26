import Expr from '../Expr'
import arity from './arity'
import { wrap } from './wrap'

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#string-functions).
 *
 * @param {string} value - The string to remove white space from the end.
 * @return {string} the string with trailing whitespaces removed
 */
export default function RTrim(value) {
  arity.exact(1, arguments, RTrim.name)
  return new Expr({ rtrim: wrap(value) })
}
