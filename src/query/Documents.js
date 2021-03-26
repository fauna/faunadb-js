import Expr from '../Expr'
import arity from './arity'
import { wrap } from './wrap'

/**
 * Returns a set of all documents in the given collection.
 * A set must be paginated in order to retrieve its values.
 *
 * @param collection a reference to the collection. Type: Ref
 * @return a new {@link Expr} instance
 * @see #Paginate(Expr)
 */
export default function Documents(collection) {
  arity.exact(1, arguments, Documents.name)
  return new Expr({ documents: wrap(collection) })
}
