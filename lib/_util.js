/**
 * Used for functions that take an options objects.
 * Fills in defaults for options not provided.
 * Throws errors for provided options that aren't recognized.
 * A default value of `undefined` is used to indicate that the option must be provided.
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applyDefaults = applyDefaults;
exports.removeUndefinedValues = removeUndefinedValues;

function applyDefaults(provided, defaults) {
  var out = {};

  for (var key in provided) {
    if (!(key in defaults)) throw new Error("No such option " + key + ".");
    out[key] = provided[key];
  }

  for (var key in defaults) {
    if (!(key in out)) out[key] = defaults[key];
  }return out;
}

/** Returns a new object without any keys where the value would be undefined. */

function removeUndefinedValues(object) {
  var res = {};
  for (var key in object) {
    var val = object[key];
    if (val !== undefined) res[key] = val;
  }
  return res;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9fdXRpbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQU1PLFNBQVMsYUFBYSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUU7QUFDaEQsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFBOztBQUVkLE9BQUssSUFBTSxHQUFHLElBQUksUUFBUSxFQUFFO0FBQzFCLFFBQUksRUFBRSxHQUFHLElBQUksUUFBUSxDQUFBLEFBQUMsRUFDcEIsTUFBTSxJQUFJLEtBQUsscUJBQW1CLEdBQUcsT0FBSSxDQUFBO0FBQzNDLE9BQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUE7R0FDekI7O0FBRUQsT0FBSyxJQUFNLEdBQUcsSUFBSSxRQUFRO0FBQ3hCLFFBQUksRUFBRSxHQUFHLElBQUksR0FBRyxDQUFBLEFBQUMsRUFDZixHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0dBQUEsQUFFNUIsT0FBTyxHQUFHLENBQUE7Q0FDWDs7OztBQUdNLFNBQVMscUJBQXFCLENBQUMsTUFBTSxFQUFFO0FBQzVDLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQTtBQUNkLE9BQUssSUFBTSxHQUFHLElBQUksTUFBTSxFQUFFO0FBQ3hCLFFBQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUN2QixRQUFJLEdBQUcsS0FBSyxTQUFTLEVBQ25CLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7R0FDakI7QUFDRCxTQUFPLEdBQUcsQ0FBQTtDQUNYIiwiZmlsZSI6Il91dGlsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBVc2VkIGZvciBmdW5jdGlvbnMgdGhhdCB0YWtlIGFuIG9wdGlvbnMgb2JqZWN0cy5cbiAqIEZpbGxzIGluIGRlZmF1bHRzIGZvciBvcHRpb25zIG5vdCBwcm92aWRlZC5cbiAqIFRocm93cyBlcnJvcnMgZm9yIHByb3ZpZGVkIG9wdGlvbnMgdGhhdCBhcmVuJ3QgcmVjb2duaXplZC5cbiAqIEEgZGVmYXVsdCB2YWx1ZSBvZiBgdW5kZWZpbmVkYCBpcyB1c2VkIHRvIGluZGljYXRlIHRoYXQgdGhlIG9wdGlvbiBtdXN0IGJlIHByb3ZpZGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXBwbHlEZWZhdWx0cyhwcm92aWRlZCwgZGVmYXVsdHMpIHtcbiAgY29uc3Qgb3V0ID0ge31cblxuICBmb3IgKGNvbnN0IGtleSBpbiBwcm92aWRlZCkge1xuICAgIGlmICghKGtleSBpbiBkZWZhdWx0cykpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIHN1Y2ggb3B0aW9uICR7a2V5fS5gKVxuICAgIG91dFtrZXldID0gcHJvdmlkZWRba2V5XVxuICB9XG5cbiAgZm9yIChjb25zdCBrZXkgaW4gZGVmYXVsdHMpXG4gICAgaWYgKCEoa2V5IGluIG91dCkpXG4gICAgICBvdXRba2V5XSA9IGRlZmF1bHRzW2tleV1cblxuICByZXR1cm4gb3V0XG59XG5cbi8qKiBSZXR1cm5zIGEgbmV3IG9iamVjdCB3aXRob3V0IGFueSBrZXlzIHdoZXJlIHRoZSB2YWx1ZSB3b3VsZCBiZSB1bmRlZmluZWQuICovXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlVW5kZWZpbmVkVmFsdWVzKG9iamVjdCkge1xuICBjb25zdCByZXMgPSB7fVxuICBmb3IgKGNvbnN0IGtleSBpbiBvYmplY3QpIHtcbiAgICBjb25zdCB2YWwgPSBvYmplY3Rba2V5XVxuICAgIGlmICh2YWwgIT09IHVuZGVmaW5lZClcbiAgICAgIHJlc1trZXldID0gdmFsXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuIl19