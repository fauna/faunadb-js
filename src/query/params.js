/**
 Adds optional parameters to the query.
 *
 * @ignore
 * */
export default function params(mainParams, optionalParams) {
  for (var key in optionalParams) {
    var val = optionalParams[key]
    if (val !== null && val !== undefined) {
      mainParams[key] = val
    }
  }
  return mainParams
}
