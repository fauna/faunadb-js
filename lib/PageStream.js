'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _defineProperty = require('babel-runtime/helpers/define-property')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _objects = require('./objects');

var _query = require('./query');

var query = _interopRequireWildcard(_query);

var _AsyncStream2 = require('./AsyncStream');

var _AsyncStream3 = _interopRequireDefault(_AsyncStream2);

var _util = require('./_util');

/**
Used to iterate over the pages of a query.
Yields whole pages (Arrays) at a time.
See {@link PageStream.elements} to use stream over individual elements.
*/

var PageStream = (function (_AsyncStream) {
  _inherits(PageStream, _AsyncStream);

  _createClass(PageStream, null, [{
    key: 'elements',

    /**
    Yields individual elements rather than whole pages at a time.
    Parameters are the same as the constructor.
    @return {AsyncStream}
    */
    value: function elements(client, set) {
      var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      return new PageStream(client, set, opts).flatten();
    }

    /**
     * @param {Client} client
     * @param {Object} set Set query made by {@link match} or similar.
     * @param {number} opts.pageSize Number of elements in each page.
     * @param {lambda} opts.mapLambda Mapping query applied to each element of each page.
     */
  }]);

  function PageStream(client, set) {
    var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, PageStream);

    _get(Object.getPrototypeOf(PageStream.prototype), 'constructor', this).call(this);
    this._client = client;
    this._set = set;

    _Object$assign(this, (0, _util.applyDefaults)(opts, {
      // `undefined` automatically removed from queries by JSON.stringify.
      pageSize: undefined,
      mapLambda: null
    }));

    this._direction = undefined;
    this._cursor = undefined;
  }

  /** @override */

  _createClass(PageStream, [{
    key: 'next',
    value: function next() {
      var q, page;
      return _regeneratorRuntime.async(function next$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!(this._cursor === 'done')) {
              context$2$0.next = 2;
              break;
            }

            return context$2$0.abrupt('return', { done: true });

          case 2:
            q = query.paginate(this._set, _defineProperty({ size: this.pageSize }, this._direction, this._cursor));

            if (this.mapLambda !== null) q = query.map(this.mapLambda, q);

            context$2$0.t0 = _objects.Page;
            context$2$0.next = 7;
            return _regeneratorRuntime.awrap(this._client.query(q));

          case 7:
            context$2$0.t1 = context$2$0.sent;
            page = context$2$0.t0.fromRaw.call(context$2$0.t0, context$2$0.t1);

            if (this._direction === undefined) this._direction = page.after === undefined ? 'before' : 'after';
            this._cursor = page[this._direction];

            if (this._cursor === undefined) this._cursor = 'done';
            return context$2$0.abrupt('return', { done: false, value: page.data });

          case 13:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }]);

  return PageStream;
})(_AsyncStream3['default']);

exports['default'] = PageStream;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9QYWdlU3RyZWFtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt1QkFBbUIsV0FBVzs7cUJBQ1AsU0FBUzs7SUFBcEIsS0FBSzs7NEJBQ08sZUFBZTs7OztvQkFDWCxTQUFTOzs7Ozs7OztJQU9oQixVQUFVO1lBQVYsVUFBVTs7ZUFBVixVQUFVOzs7Ozs7OztXQU1kLGtCQUFDLE1BQU0sRUFBRSxHQUFHLEVBQVc7VUFBVCxJQUFJLHlEQUFDLEVBQUU7O0FBQ2xDLGFBQU8sSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTtLQUNuRDs7Ozs7Ozs7OztBQVFVLFdBaEJRLFVBQVUsQ0FnQmpCLE1BQU0sRUFBRSxHQUFHLEVBQVc7UUFBVCxJQUFJLHlEQUFDLEVBQUU7OzBCQWhCYixVQUFVOztBQWlCM0IsK0JBakJpQixVQUFVLDZDQWlCcEI7QUFDUCxRQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQTtBQUNyQixRQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQTs7QUFFZixtQkFBYyxJQUFJLEVBQUUseUJBQWMsSUFBSSxFQUFFOztBQUV0QyxjQUFRLEVBQUUsU0FBUztBQUNuQixlQUFTLEVBQUUsSUFBSTtLQUNoQixDQUFDLENBQUMsQ0FBQTs7QUFFSCxRQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQTtBQUMzQixRQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQTtHQUN6Qjs7OztlQTdCa0IsVUFBVTs7V0FnQ25CO1VBSUosQ0FBQyxFQUlDLElBQUk7Ozs7a0JBUE4sSUFBSSxDQUFDLE9BQU8sS0FBSyxNQUFNLENBQUE7Ozs7O2dEQUNsQixFQUFDLElBQUksRUFBRSxJQUFJLEVBQUM7OztBQUVqQixhQUFDLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxvQkFBRyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsSUFBRyxJQUFJLENBQUMsVUFBVSxFQUFHLElBQUksQ0FBQyxPQUFPLEVBQUU7O0FBQ3pGLGdCQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxFQUN6QixDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFBOzs7OzZDQUVGLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzs7OztBQUEvQyxnQkFBSSxrQkFBUSxPQUFPOztBQUV6QixnQkFBSSxJQUFJLENBQUMsVUFBVSxLQUFLLFNBQVMsRUFDL0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxLQUFLLFNBQVMsR0FBRyxRQUFRLEdBQUcsT0FBTyxDQUFBO0FBQ2pFLGdCQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7O0FBRXBDLGdCQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssU0FBUyxFQUM1QixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQTtnREFDaEIsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFDOzs7Ozs7O0tBQ3ZDOzs7U0FqRGtCLFVBQVU7OztxQkFBVixVQUFVIiwiZmlsZSI6IlBhZ2VTdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1BhZ2V9IGZyb20gJy4vb2JqZWN0cydcbmltcG9ydCAqIGFzIHF1ZXJ5IGZyb20gJy4vcXVlcnknXG5pbXBvcnQgQXN5bmNTdHJlYW0gZnJvbSAnLi9Bc3luY1N0cmVhbSdcbmltcG9ydCB7YXBwbHlEZWZhdWx0c30gZnJvbSAnLi9fdXRpbCdcblxuLyoqXG5Vc2VkIHRvIGl0ZXJhdGUgb3ZlciB0aGUgcGFnZXMgb2YgYSBxdWVyeS5cbllpZWxkcyB3aG9sZSBwYWdlcyAoQXJyYXlzKSBhdCBhIHRpbWUuXG5TZWUge0BsaW5rIFBhZ2VTdHJlYW0uZWxlbWVudHN9IHRvIHVzZSBzdHJlYW0gb3ZlciBpbmRpdmlkdWFsIGVsZW1lbnRzLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhZ2VTdHJlYW0gZXh0ZW5kcyBBc3luY1N0cmVhbSB7XG4gIC8qKlxuICBZaWVsZHMgaW5kaXZpZHVhbCBlbGVtZW50cyByYXRoZXIgdGhhbiB3aG9sZSBwYWdlcyBhdCBhIHRpbWUuXG4gIFBhcmFtZXRlcnMgYXJlIHRoZSBzYW1lIGFzIHRoZSBjb25zdHJ1Y3Rvci5cbiAgQHJldHVybiB7QXN5bmNTdHJlYW19XG4gICovXG4gIHN0YXRpYyBlbGVtZW50cyhjbGllbnQsIHNldCwgb3B0cz17fSkge1xuICAgIHJldHVybiBuZXcgUGFnZVN0cmVhbShjbGllbnQsIHNldCwgb3B0cykuZmxhdHRlbigpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtDbGllbnR9IGNsaWVudFxuICAgKiBAcGFyYW0ge09iamVjdH0gc2V0IFNldCBxdWVyeSBtYWRlIGJ5IHtAbGluayBtYXRjaH0gb3Igc2ltaWxhci5cbiAgICogQHBhcmFtIHtudW1iZXJ9IG9wdHMucGFnZVNpemUgTnVtYmVyIG9mIGVsZW1lbnRzIGluIGVhY2ggcGFnZS5cbiAgICogQHBhcmFtIHtsYW1iZGF9IG9wdHMubWFwTGFtYmRhIE1hcHBpbmcgcXVlcnkgYXBwbGllZCB0byBlYWNoIGVsZW1lbnQgb2YgZWFjaCBwYWdlLlxuICAgKi9cbiAgY29uc3RydWN0b3IoY2xpZW50LCBzZXQsIG9wdHM9e30pIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5fY2xpZW50ID0gY2xpZW50XG4gICAgdGhpcy5fc2V0ID0gc2V0XG5cbiAgICBPYmplY3QuYXNzaWduKHRoaXMsIGFwcGx5RGVmYXVsdHMob3B0cywge1xuICAgICAgLy8gYHVuZGVmaW5lZGAgYXV0b21hdGljYWxseSByZW1vdmVkIGZyb20gcXVlcmllcyBieSBKU09OLnN0cmluZ2lmeS5cbiAgICAgIHBhZ2VTaXplOiB1bmRlZmluZWQsXG4gICAgICBtYXBMYW1iZGE6IG51bGxcbiAgICB9KSlcblxuICAgIHRoaXMuX2RpcmVjdGlvbiA9IHVuZGVmaW5lZFxuICAgIHRoaXMuX2N1cnNvciA9IHVuZGVmaW5lZFxuICB9XG5cbiAgLyoqIEBvdmVycmlkZSAqL1xuICBhc3luYyBuZXh0KCkge1xuICAgIGlmICh0aGlzLl9jdXJzb3IgPT09ICdkb25lJylcbiAgICAgIHJldHVybiB7ZG9uZTogdHJ1ZX1cblxuICAgIGxldCBxID0gcXVlcnkucGFnaW5hdGUodGhpcy5fc2V0LCB7c2l6ZTogdGhpcy5wYWdlU2l6ZSwgW3RoaXMuX2RpcmVjdGlvbl06IHRoaXMuX2N1cnNvcn0pXG4gICAgaWYgKHRoaXMubWFwTGFtYmRhICE9PSBudWxsKVxuICAgICAgcSA9IHF1ZXJ5Lm1hcCh0aGlzLm1hcExhbWJkYSwgcSlcblxuICAgIGNvbnN0IHBhZ2UgPSBQYWdlLmZyb21SYXcoYXdhaXQgdGhpcy5fY2xpZW50LnF1ZXJ5KHEpKVxuXG4gICAgaWYgKHRoaXMuX2RpcmVjdGlvbiA9PT0gdW5kZWZpbmVkKVxuICAgICAgdGhpcy5fZGlyZWN0aW9uID0gcGFnZS5hZnRlciA9PT0gdW5kZWZpbmVkID8gJ2JlZm9yZScgOiAnYWZ0ZXInXG4gICAgdGhpcy5fY3Vyc29yID0gcGFnZVt0aGlzLl9kaXJlY3Rpb25dXG5cbiAgICBpZiAodGhpcy5fY3Vyc29yID09PSB1bmRlZmluZWQpXG4gICAgICB0aGlzLl9jdXJzb3IgPSAnZG9uZSdcbiAgICByZXR1cm4ge2RvbmU6IGZhbHNlLCB2YWx1ZTogcGFnZS5kYXRhfVxuICB9XG59XG4iXX0=