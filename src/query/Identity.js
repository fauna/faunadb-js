import deprecate from 'util-deprecate'
import Expr from '../Expr'
import { arity } from './common'

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#authentication).
 *
 * @return {Expr}
 */

const Identity = deprecate(function() {
  arity.exact(0, arguments, Identity.name)
  return new Expr({ identity: null })
}, 'Identity() is deprecated, use CurrentIdentity() instead')

export default Identity
