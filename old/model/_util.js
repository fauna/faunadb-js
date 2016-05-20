/**
 * Copy of JSON data.
 * Passes Refs and Sets through directly with no copying..
 */
function objectDup(data) {
  if (isObject(data)) {
    var obj = {};
    for (var key in data) {
      obj[key] = objectDup(data[key]);
    }
    return obj;
  } else {
    return data;
  }
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
function getPath(path, data) {
  for (var i = 0; i < path.length; ++i) {
    var pathElem = path[i];
    if (!isObject(data) || !(pathElem in data)) {
      return null;
    }
    data = data[pathElem];
  }

  return data;
}

/**
 * Opposite of get_path.
 * If path does not fully exist yet, creates parts of the path as it goes.
 * e.g. `setPath(["a", "b"], 1, {"a": {}})` should change data to be `{"a": {"b": 1}}`.
 */
function setPath(path, value, data) {
  for (var i = 0; i < path.length - 1; ++i) {
    var pathElem = path[i];
    if (!(pathElem in data)) {
      data[pathElem] = {};
    }
    data = data[pathElem];
  }
  data[path[path.length - 1]] = value;
}

/**
 * Difference between two dicts.
 * Removed fields are represented as being changed to null.
 * (FaunaDB treats null sets as deletion.)
 */
function calculateDiff(original, current) {
  var diff = {};

  for (var origKey in original) {
    if (!(origKey in current)) {
      diff[origKey] = null;
    }
  }

  for (var currKey in current) {
    var prev = original[currKey];
    var curr = current[currKey];

    if (isObject(prev) && isObject(curr)) {
      var innerDiff = calculateDiff(prev, curr);
      if (Object.keys(innerDiff).length > 0) {
        diff[currKey] = innerDiff;
      }
    } else if (prev !== curr) {
      diff[currKey] = curr;
    }
  }

  return diff;
}

/** Accepts only plain objects, not Refs or Sets. */
function isObject(object) {
  return typeof object === 'object' && object.constructor === Object;
}

module.exports = {
  objectDup: objectDup,
  getPath: getPath,
  setPath: setPath,
  calculateDiff: calculateDiff
};
