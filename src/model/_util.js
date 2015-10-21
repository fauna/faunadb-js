/**
 * Copy of JSON data.
 * Passes Refs and Sets through directly with no copying..
 */
export function objectDup(data) {
  if (isObject(data)) {
    const obj = {}
    for (const key in data)
      obj[key] = objectDup(data[key])
    return obj
  } else
    return data
}

/**
 * Recursively looks for :samp:`path` in :samp:`data`.
 * e.g. :samp:`get_path(["a", "b"], {"a": {"b": 1}})` should be 1.
 *
 * @param {Array} path Object keys keys, outermost to innermost.
 * @param {Object} data Object of data (potentially nested).
 * @return
 *   `null` if the path can not be traversed to the end;
 *   else the value at the end of the path.
 */
export function getPath(path, data) {
  for (const pathElem of path) {
    if (!isObject(data) || !(pathElem in data))
      return null
    data = data[pathElem]
  }
  return data
}

/**
 * Opposite of get_path.
 * If path does not fully exist yet, creates parts of the path as it goes.
 * e.g. `setPath(["a", "b"], 1, {"a": {}})` should change data to be `{"a": {"b": 1}}`.
 */
export function setPath(path, value, data) {
  for (let i = 0; i < path.length - 1; i = i + 1) {
    const pathElem = path[i]
    if (!(pathElem in data))
      data[pathElem] = {}
    data = data[pathElem]
  }
  data[path[path.length - 1]] = value
}

/**
 * Difference between two dicts.
 * Removed fields are represented as being changed to null.
 * (FaunaDB treats null sets as deletion.)
 */
export function calculateDiff(original, current) {
  const diff = {}

  for (const key in original)
    if (!(key in current))
      diff[key] = null

  for (const key in current) {
    const prev = original[key], curr = current[key]
    if (isObject(prev) && isObject(curr)) {
      const innerDiff = calculateDiff(prev, curr)
      if (Object.keys(innerDiff).length > 0)
        diff[key] = innerDiff
    } else if (prev !== curr)
      diff[key] = curr
  }

  return diff
}

/** Accepts only plain objects, not Refs or Sets. */
function isObject(object) {
  return typeof object === 'object' && object.constructor === Object
}
