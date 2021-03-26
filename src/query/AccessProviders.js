import Expr from '../Expr'
import { defaults } from '../_util'
import arity from './arity'
import { wrap } from './wrap'

/**
 *
 * @param {module:query~ExprArg} scope
 *   The Ref of the database set's scope.
 * @return {Expr}
 */
export default function AccessProviders(scope) {
  arity.max(1, arguments, AccessProviders.name)
  scope = defaults(scope, null)
  return new Expr({ access_providers: wrap(scope) })
}
