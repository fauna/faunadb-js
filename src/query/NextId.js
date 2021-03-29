import deprecate from 'util-deprecate'
import Expr from '../Expr'
import { arity } from './common'

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @deprecated use NewId instead
 * @return {Expr}
 */
const NextId = deprecate(function() {
  arity.exact(0, arguments, NextId.name)
  return new Expr({ next_id: null })
}, 'NextId() is deprecated, use NewId() instead')

export default NextId
