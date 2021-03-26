import Expr from '../Expr'
import { defaults } from '../_util'
import arity from './arity'
import params from './params'
import { wrap } from './wrap'

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A numbers to round.
 * @param {...module:query~ExprArg} terms
 *   An optional precision
 * @return {Expr}
 */
export default function Round(value, precision) {
  arity.min(1, arguments, Round.name)
  precision = defaults(precision, null)
  return new Expr(
    params({ round: wrap(value) }, { precision: wrap(precision) })
  )
}
