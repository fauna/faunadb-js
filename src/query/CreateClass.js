import deprecate from 'util-deprecate'
import Expr from '../Expr'
import { arity, wrap } from './common'

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} params
 *   An object of parameters used to create a class.
 *     - name (required): the name of the class to create
 * @return {Expr}
 *
 * @deprecated use CreateCollection instead
 */
const CreateClass = deprecate(function(params) {
  arity.exact(1, arguments, CreateClass.name)
  return new Expr({ create_class: wrap(params) })
}, 'CreateClass() is deprecated, use CreateCollection() instead')

export default CreateClass
