import deprecate from 'util-deprecate'
import Expr from '../Expr'
import arity from './arity'

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#authentication).
 *
 * @return {Expr}
 */
function HasIdentity() {
  arity.exact(0, arguments, HasIdentity.name)
  return new Expr({ has_identity: null })
}

export default deprecate(
  HasIdentity,
  'HasIdentity() is deprecated, use HasCurrentIdentity() instead'
)
