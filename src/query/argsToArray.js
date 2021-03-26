/**
 * @ignore
 */
export default function argsToArray(args) {
  var rv = []
  rv.push.apply(rv, args)
  return rv
}
