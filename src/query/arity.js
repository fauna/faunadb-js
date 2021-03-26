import { InvalidArity } from '../errors'

/**
 * @ignore
 */
export default function arity(min, max, args, callerFunc) {
  if (
    (min !== null && args.length < min) ||
    (max !== null && args.length > max)
  ) {
    throw new InvalidArity(min, max, args.length, callerFunc)
  }
}

arity.exact = function(n, args, callerFunc) {
  arity(n, n, args, callerFunc)
}
arity.max = function(n, args, callerFunc) {
  arity(null, n, args, callerFunc)
}
arity.min = function(n, args, callerFunc) {
  arity(n, null, args, callerFunc)
}
arity.between = function(min, max, args, callerFunc) {
  arity(min, max, args, callerFunc)
}
