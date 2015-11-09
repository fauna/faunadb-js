'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _util = require('../_util');

/**
 * Stores information about a field in a {@link Model}.
 */

var Field =
/**
 * You don't need to call this directly;
 * this is called for you by {@link Model#setup} and {@link Model#addField}.
 *
 * @param {Codec} opts.codec
 *
 * @param {@Array<string>} opts.path
 *   If a model is created with `MyModel.setup(name, {x: {}, y: {}})`,
 *   the instance data will look like `{ref: ..., ts: ..., data: {x: ..., y: ...}}`.
 *
 *   You can override this by providing a different path.
 */
function Field(opts) {
  _classCallCheck(this, Field);

  _Object$assign(this, (0, _util.applyDefaults)(opts, {
    codec: null,
    path: null
  }));
};

exports['default'] = Field;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9GaWVsZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUE0QixVQUFVOzs7Ozs7SUFLakIsS0FBSzs7Ozs7Ozs7Ozs7OztBQWFiLFNBYlEsS0FBSyxDQWFaLElBQUksRUFBRTt3QkFiQyxLQUFLOztBQWN0QixpQkFBYyxJQUFJLEVBQUUseUJBQWMsSUFBSSxFQUFFO0FBQ3RDLFNBQUssRUFBRSxJQUFJO0FBQ1gsUUFBSSxFQUFFLElBQUk7R0FDWCxDQUFDLENBQUMsQ0FBQTtDQUNKOztxQkFsQmtCLEtBQUsiLCJmaWxlIjoiRmllbGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2FwcGx5RGVmYXVsdHN9IGZyb20gJy4uL191dGlsJ1xuXG4vKipcbiAqIFN0b3JlcyBpbmZvcm1hdGlvbiBhYm91dCBhIGZpZWxkIGluIGEge0BsaW5rIE1vZGVsfS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmllbGQge1xuICAvKipcbiAgICogWW91IGRvbid0IG5lZWQgdG8gY2FsbCB0aGlzIGRpcmVjdGx5O1xuICAgKiB0aGlzIGlzIGNhbGxlZCBmb3IgeW91IGJ5IHtAbGluayBNb2RlbCNzZXR1cH0gYW5kIHtAbGluayBNb2RlbCNhZGRGaWVsZH0uXG4gICAqXG4gICAqIEBwYXJhbSB7Q29kZWN9IG9wdHMuY29kZWNcbiAgICpcbiAgICogQHBhcmFtIHtAQXJyYXk8c3RyaW5nPn0gb3B0cy5wYXRoXG4gICAqICAgSWYgYSBtb2RlbCBpcyBjcmVhdGVkIHdpdGggYE15TW9kZWwuc2V0dXAobmFtZSwge3g6IHt9LCB5OiB7fX0pYCxcbiAgICogICB0aGUgaW5zdGFuY2UgZGF0YSB3aWxsIGxvb2sgbGlrZSBge3JlZjogLi4uLCB0czogLi4uLCBkYXRhOiB7eDogLi4uLCB5OiAuLi59fWAuXG4gICAqXG4gICAqICAgWW91IGNhbiBvdmVycmlkZSB0aGlzIGJ5IHByb3ZpZGluZyBhIGRpZmZlcmVudCBwYXRoLlxuICAgKi9cbiAgY29uc3RydWN0b3Iob3B0cykge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcywgYXBwbHlEZWZhdWx0cyhvcHRzLCB7XG4gICAgICBjb2RlYzogbnVsbCxcbiAgICAgIHBhdGg6IG51bGxcbiAgICB9KSlcbiAgfVxufSJdfQ==