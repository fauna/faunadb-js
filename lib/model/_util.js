/**
 * Copy of JSON data.
 * Passes Refs and Sets through directly with no copying..
 */
'use strict';

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.objectDup = objectDup;
exports.getPath = getPath;
exports.setPath = setPath;
exports.calculateDiff = calculateDiff;

function objectDup(data) {
  if (isObject(data)) {
    var obj = {};
    for (var key in data) {
      obj[key] = objectDup(data[key]);
    }return obj;
  } else return data;
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
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = _getIterator(path), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var pathElem = _step.value;

      if (!isObject(data) || !(pathElem in data)) return null;
      data = data[pathElem];
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return data;
}

/**
 * Opposite of get_path.
 * If path does not fully exist yet, creates parts of the path as it goes.
 * e.g. `setPath(["a", "b"], 1, {"a": {}})` should change data to be `{"a": {"b": 1}}`.
 */

function setPath(path, value, data) {
  for (var i = 0; i < path.length - 1; i = i + 1) {
    var pathElem = path[i];
    if (!(pathElem in data)) data[pathElem] = {};
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

  for (var key in original) {
    if (!(key in current)) diff[key] = null;
  }for (var key in current) {
    var prev = original[key],
        curr = current[key];
    if (isObject(prev) && isObject(curr)) {
      var innerDiff = calculateDiff(prev, curr);
      if (_Object$keys(innerDiff).length > 0) diff[key] = innerDiff;
    } else if (prev !== curr) diff[key] = curr;
  }

  return diff;
}

/** Accepts only plain objects, not Refs or Sets. */
function isObject(object) {
  return typeof object === 'object' && object.constructor === Object;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9fdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFJTyxTQUFTLFNBQVMsQ0FBQyxJQUFJLEVBQUU7QUFDOUIsTUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDbEIsUUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFBO0FBQ2QsU0FBSyxJQUFNLEdBQUcsSUFBSSxJQUFJO0FBQ3BCLFNBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7S0FBQSxBQUNqQyxPQUFPLEdBQUcsQ0FBQTtHQUNYLE1BQ0MsT0FBTyxJQUFJLENBQUE7Q0FDZDs7Ozs7Ozs7Ozs7OztBQVlNLFNBQVMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUU7Ozs7OztBQUNsQyxzQ0FBdUIsSUFBSSw0R0FBRTtVQUFsQixRQUFROztBQUNqQixVQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsUUFBUSxJQUFJLElBQUksQ0FBQSxBQUFDLEVBQ3hDLE9BQU8sSUFBSSxDQUFBO0FBQ2IsVUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtLQUN0Qjs7Ozs7Ozs7Ozs7Ozs7OztBQUNELFNBQU8sSUFBSSxDQUFBO0NBQ1o7Ozs7Ozs7O0FBT00sU0FBUyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7QUFDekMsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQzlDLFFBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUN4QixRQUFJLEVBQUUsUUFBUSxJQUFJLElBQUksQ0FBQSxBQUFDLEVBQ3JCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUE7QUFDckIsUUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtHQUN0QjtBQUNELE1BQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQTtDQUNwQzs7Ozs7Ozs7QUFPTSxTQUFTLGFBQWEsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFO0FBQy9DLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQTs7QUFFZixPQUFLLElBQU0sR0FBRyxJQUFJLFFBQVE7QUFDeEIsUUFBSSxFQUFFLEdBQUcsSUFBSSxPQUFPLENBQUEsQUFBQyxFQUNuQixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFBO0dBQUEsQUFFcEIsS0FBSyxJQUFNLEdBQUcsSUFBSSxPQUFPLEVBQUU7QUFDekIsUUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQztRQUFFLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDL0MsUUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3BDLFVBQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDM0MsVUFBSSxhQUFZLFNBQVMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQ25DLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUE7S0FDeEIsTUFBTSxJQUFJLElBQUksS0FBSyxJQUFJLEVBQ3RCLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUE7R0FDbkI7O0FBRUQsU0FBTyxJQUFJLENBQUE7Q0FDWjs7O0FBR0QsU0FBUyxRQUFRLENBQUMsTUFBTSxFQUFFO0FBQ3hCLFNBQU8sT0FBTyxNQUFNLEtBQUssUUFBUSxJQUFJLE1BQU0sQ0FBQyxXQUFXLEtBQUssTUFBTSxDQUFBO0NBQ25FIiwiZmlsZSI6Il91dGlsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5IG9mIEpTT04gZGF0YS5cbiAqIFBhc3NlcyBSZWZzIGFuZCBTZXRzIHRocm91Z2ggZGlyZWN0bHkgd2l0aCBubyBjb3B5aW5nLi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9iamVjdER1cChkYXRhKSB7XG4gIGlmIChpc09iamVjdChkYXRhKSkge1xuICAgIGNvbnN0IG9iaiA9IHt9XG4gICAgZm9yIChjb25zdCBrZXkgaW4gZGF0YSlcbiAgICAgIG9ialtrZXldID0gb2JqZWN0RHVwKGRhdGFba2V5XSlcbiAgICByZXR1cm4gb2JqXG4gIH0gZWxzZVxuICAgIHJldHVybiBkYXRhXG59XG5cbi8qKlxuICogUmVjdXJzaXZlbHkgbG9va3MgZm9yIDpzYW1wOmBwYXRoYCBpbiA6c2FtcDpgZGF0YWAuXG4gKiBlLmcuIDpzYW1wOmBnZXRfcGF0aChbXCJhXCIsIFwiYlwiXSwge1wiYVwiOiB7XCJiXCI6IDF9fSlgIHNob3VsZCBiZSAxLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHBhdGggT2JqZWN0IGtleXMga2V5cywgb3V0ZXJtb3N0IHRvIGlubmVybW9zdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIE9iamVjdCBvZiBkYXRhIChwb3RlbnRpYWxseSBuZXN0ZWQpLlxuICogQHJldHVyblxuICogICBgbnVsbGAgaWYgdGhlIHBhdGggY2FuIG5vdCBiZSB0cmF2ZXJzZWQgdG8gdGhlIGVuZDtcbiAqICAgZWxzZSB0aGUgdmFsdWUgYXQgdGhlIGVuZCBvZiB0aGUgcGF0aC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFBhdGgocGF0aCwgZGF0YSkge1xuICBmb3IgKGNvbnN0IHBhdGhFbGVtIG9mIHBhdGgpIHtcbiAgICBpZiAoIWlzT2JqZWN0KGRhdGEpIHx8ICEocGF0aEVsZW0gaW4gZGF0YSkpXG4gICAgICByZXR1cm4gbnVsbFxuICAgIGRhdGEgPSBkYXRhW3BhdGhFbGVtXVxuICB9XG4gIHJldHVybiBkYXRhXG59XG5cbi8qKlxuICogT3Bwb3NpdGUgb2YgZ2V0X3BhdGguXG4gKiBJZiBwYXRoIGRvZXMgbm90IGZ1bGx5IGV4aXN0IHlldCwgY3JlYXRlcyBwYXJ0cyBvZiB0aGUgcGF0aCBhcyBpdCBnb2VzLlxuICogZS5nLiBgc2V0UGF0aChbXCJhXCIsIFwiYlwiXSwgMSwge1wiYVwiOiB7fX0pYCBzaG91bGQgY2hhbmdlIGRhdGEgdG8gYmUgYHtcImFcIjoge1wiYlwiOiAxfX1gLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0UGF0aChwYXRoLCB2YWx1ZSwgZGF0YSkge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHBhdGgubGVuZ3RoIC0gMTsgaSA9IGkgKyAxKSB7XG4gICAgY29uc3QgcGF0aEVsZW0gPSBwYXRoW2ldXG4gICAgaWYgKCEocGF0aEVsZW0gaW4gZGF0YSkpXG4gICAgICBkYXRhW3BhdGhFbGVtXSA9IHt9XG4gICAgZGF0YSA9IGRhdGFbcGF0aEVsZW1dXG4gIH1cbiAgZGF0YVtwYXRoW3BhdGgubGVuZ3RoIC0gMV1dID0gdmFsdWVcbn1cblxuLyoqXG4gKiBEaWZmZXJlbmNlIGJldHdlZW4gdHdvIGRpY3RzLlxuICogUmVtb3ZlZCBmaWVsZHMgYXJlIHJlcHJlc2VudGVkIGFzIGJlaW5nIGNoYW5nZWQgdG8gbnVsbC5cbiAqIChGYXVuYURCIHRyZWF0cyBudWxsIHNldHMgYXMgZGVsZXRpb24uKVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FsY3VsYXRlRGlmZihvcmlnaW5hbCwgY3VycmVudCkge1xuICBjb25zdCBkaWZmID0ge31cblxuICBmb3IgKGNvbnN0IGtleSBpbiBvcmlnaW5hbClcbiAgICBpZiAoIShrZXkgaW4gY3VycmVudCkpXG4gICAgICBkaWZmW2tleV0gPSBudWxsXG5cbiAgZm9yIChjb25zdCBrZXkgaW4gY3VycmVudCkge1xuICAgIGNvbnN0IHByZXYgPSBvcmlnaW5hbFtrZXldLCBjdXJyID0gY3VycmVudFtrZXldXG4gICAgaWYgKGlzT2JqZWN0KHByZXYpICYmIGlzT2JqZWN0KGN1cnIpKSB7XG4gICAgICBjb25zdCBpbm5lckRpZmYgPSBjYWxjdWxhdGVEaWZmKHByZXYsIGN1cnIpXG4gICAgICBpZiAoT2JqZWN0LmtleXMoaW5uZXJEaWZmKS5sZW5ndGggPiAwKVxuICAgICAgICBkaWZmW2tleV0gPSBpbm5lckRpZmZcbiAgICB9IGVsc2UgaWYgKHByZXYgIT09IGN1cnIpXG4gICAgICBkaWZmW2tleV0gPSBjdXJyXG4gIH1cblxuICByZXR1cm4gZGlmZlxufVxuXG4vKiogQWNjZXB0cyBvbmx5IHBsYWluIG9iamVjdHMsIG5vdCBSZWZzIG9yIFNldHMuICovXG5mdW5jdGlvbiBpc09iamVjdChvYmplY3QpIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmIG9iamVjdC5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0XG59XG4iXX0=