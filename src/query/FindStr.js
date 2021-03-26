import Expr from '../Expr'
import { defaults } from '../_util'
import arity from './arity'
import params from './params'
import { wrap } from './wrap'

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#string-functions).
 *
 * @param {string} value - A string to search.
 * @param {string} find - Find the first position of this string in the search string
 * @param {int} start - An optional start offset into the search string
 * @return {int} location of the found string or -1 if not found
 */
export default function FindStr(value, find, start) {
  arity.between(2, 3, arguments, FindStr.name)
  start = defaults(start, null)
  return new Expr(
    params({ findstr: wrap(value), find: wrap(find) }, { start: wrap(start) })
  )
}
