/**
Asynchronous iterator protocol. Asynchronously produces a stream of values on demand.
AsyncStreams are mutable objects, meaning they can only be used once.

Unlike a series of events, this doesn't produce the next value unless asked to,
making functions like {@link AsyncStream#takeWhile} possible.
*/
'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _getIterator = require('babel-runtime/core-js/get-iterator')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var AsyncStream = (function () {
  function AsyncStream() {
    _classCallCheck(this, AsyncStream);
  }

  _createClass(AsyncStream, [{
    key: 'next',

    /**
    This works like an async version of the [iterator protocol](
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterator).
    @abstract
    @return {Promise<{value, done: boolean}>}
      If `done`, `value` should be ignored.
    */
    value: function next() {
      return _regeneratorRuntime.async(function next$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            throw new Error('Not implemented.');

          case 1:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }

    /**
    Perform an action for each value in the stream.
    @param {function(elem): void} doEach
    @return {Promise<void>}
    */
  }, {
    key: 'each',
    value: function each(doEach) {
      var _ref, value, done;

      return _regeneratorRuntime.async(function each$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this.next());

          case 2:
            _ref = context$2$0.sent;
            value = _ref.value;
            done = _ref.done;

            if (!done) {
              context$2$0.next = 7;
              break;
            }

            return context$2$0.abrupt('break', 11);

          case 7:
            context$2$0.next = 9;
            return _regeneratorRuntime.awrap(doEach(value));

          case 9:
            context$2$0.next = 0;
            break;

          case 11:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }

    /**
    Collect every value into an Array.
    @return {Promise<Array>}
    */
  }, {
    key: 'all',
    value: function all() {
      var all;
      return _regeneratorRuntime.async(function all$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            all = [];
            context$2$0.next = 3;
            return _regeneratorRuntime.awrap(this.each(function (val) {
              all.push(val);
            }));

          case 3:
            return context$2$0.abrupt('return', all);

          case 4:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }

    /**
    Lazily applies `mapFunc` to every value.
    @param {function(elem)} mapFunc
    @return {AsyncStream}
    */
  }, {
    key: 'map',
    value: function map(mapFunc) {
      return new MapStream(this, mapFunc);
    }

    /**
    Lazily removes elements not satisfying `predicate`.
    @param {function(elem): boolean} predicate
    @return {AsyncStream}
    */
  }, {
    key: 'filter',
    value: function filter(predicate) {
      return new FilterStream(this, predicate);
    }

    /**
    Ends the stream at the first element not satisfying `predicate`.
    @param {function(elem): boolean} predicate
    @return {AsyncStream}
    */
  }, {
    key: 'takeWhile',
    value: function takeWhile(predicate) {
      return new TakeWhileStream(this, predicate);
    }

    /**
    Assuming that this stream's elements are iterable, returns the concatenation of their contents.
    @return {AsyncStream}
    */
  }, {
    key: 'flatten',
    value: function flatten() {
      return new FlattenStream(this);
    }

    /**
    Applies 'flatMapFunc' to each element and concatenates the results.
    @param {function(elem): iterable} flatMapFunc
    @return {AsyncStream}
    */
  }, {
    key: 'flatMap',
    value: function flatMap(flatMapFunc) {
      return this.map(flatMapFunc).flatten();
    }
  }], [{
    key: 'fromIterable',

    /**
    Creates an AsyncStream from any [iterable](
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterable).
    */
    value: function fromIterable(iter) {
      return new IteratorStream(_getIterator(iter));
    }
  }]);

  return AsyncStream;
})();

exports['default'] = AsyncStream;

var IteratorStream = (function (_AsyncStream) {
  _inherits(IteratorStream, _AsyncStream);

  function IteratorStream(iterator) {
    _classCallCheck(this, IteratorStream);

    _get(Object.getPrototypeOf(IteratorStream.prototype), 'constructor', this).call(this);
    this.iterator = iterator;
  }

  _createClass(IteratorStream, [{
    key: 'next',
    value: function next() {
      return this.iterator.next();
    }
  }]);

  return IteratorStream;
})(AsyncStream);

var MapStream = (function (_AsyncStream2) {
  _inherits(MapStream, _AsyncStream2);

  function MapStream(base, mapFunc) {
    _classCallCheck(this, MapStream);

    _get(Object.getPrototypeOf(MapStream.prototype), 'constructor', this).call(this);
    this.base = base;
    this.mapFunc = mapFunc;
  }

  _createClass(MapStream, [{
    key: 'next',
    value: function next() {
      var _ref2, value, done;

      return _regeneratorRuntime.async(function next$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this.base.next());

          case 2:
            _ref2 = context$2$0.sent;
            value = _ref2.value;
            done = _ref2.done;

            if (!done) {
              context$2$0.next = 9;
              break;
            }

            return context$2$0.abrupt('return', { done: done });

          case 9:
            context$2$0.next = 11;
            return _regeneratorRuntime.awrap(this.mapFunc(value));

          case 11:
            context$2$0.t0 = context$2$0.sent;
            context$2$0.t1 = done;
            return context$2$0.abrupt('return', {
              value: context$2$0.t0,
              done: context$2$0.t1
            });

          case 14:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }]);

  return MapStream;
})(AsyncStream);

var FilterStream = (function (_AsyncStream3) {
  _inherits(FilterStream, _AsyncStream3);

  function FilterStream(base, predicate) {
    _classCallCheck(this, FilterStream);

    _get(Object.getPrototypeOf(FilterStream.prototype), 'constructor', this).call(this);
    this.base = base;
    this.predicate = predicate;
  }

  _createClass(FilterStream, [{
    key: 'next',
    value: function next() {
      var _ref3, value, done;

      return _regeneratorRuntime.async(function next$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this.base.next());

          case 2:
            _ref3 = context$2$0.sent;
            value = _ref3.value;
            done = _ref3.done;

            if (!done) {
              context$2$0.next = 7;
              break;
            }

            return context$2$0.abrupt('return', { done: done });

          case 7:
            context$2$0.next = 9;
            return _regeneratorRuntime.awrap(this.predicate(value));

          case 9:
            if (!context$2$0.sent) {
              context$2$0.next = 11;
              break;
            }

            return context$2$0.abrupt('return', { value: value, done: done });

          case 11:
            context$2$0.next = 0;
            break;

          case 13:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }]);

  return FilterStream;
})(AsyncStream);

var TakeWhileStream = (function (_AsyncStream4) {
  _inherits(TakeWhileStream, _AsyncStream4);

  function TakeWhileStream(base, predicate) {
    _classCallCheck(this, TakeWhileStream);

    _get(Object.getPrototypeOf(TakeWhileStream.prototype), 'constructor', this).call(this);
    this.base = base;
    this.predicate = predicate;
  }

  _createClass(TakeWhileStream, [{
    key: 'next',
    value: function next() {
      var _ref4, value, done;

      return _regeneratorRuntime.async(function next$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this.base.next());

          case 2:
            _ref4 = context$2$0.sent;
            value = _ref4.value;
            done = _ref4.done;

            if (!done) {
              context$2$0.next = 7;
              break;
            }

            return context$2$0.abrupt('return', { done: done });

          case 7:
            context$2$0.next = 9;
            return _regeneratorRuntime.awrap(this.predicate(value));

          case 9:
            if (context$2$0.sent) {
              context$2$0.next = 11;
              break;
            }

            return context$2$0.abrupt('return', { done: true });

          case 11:
            return context$2$0.abrupt('return', { value: value, done: done });

          case 12:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }]);

  return TakeWhileStream;
})(AsyncStream);

var FlattenStream = (function (_AsyncStream5) {
  _inherits(FlattenStream, _AsyncStream5);

  function FlattenStream(base) {
    _classCallCheck(this, FlattenStream);

    _get(Object.getPrototypeOf(FlattenStream.prototype), 'constructor', this).call(this);
    this.base = base;
    this.curIter = { next: function next() {
        return { done: true };
      } };
  }

  _createClass(FlattenStream, [{
    key: 'next',
    value: function next() {
      var _curIter$next, value, done, _ref5, _value, _done;

      return _regeneratorRuntime.async(function next$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            _curIter$next = this.curIter.next();
            value = _curIter$next.value;
            done = _curIter$next.done;

            if (!done) {
              context$2$0.next = 17;
              break;
            }

            context$2$0.next = 6;
            return _regeneratorRuntime.awrap(this.base.next());

          case 6:
            _ref5 = context$2$0.sent;
            _value = _ref5.value;
            _done = _ref5.done;

            if (!_done) {
              context$2$0.next = 11;
              break;
            }

            return context$2$0.abrupt('return', { done: _done });

          case 11:
            this.curIter = _getIterator(_value);
            context$2$0.next = 14;
            return _regeneratorRuntime.awrap(this.next());

          case 14:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 17:
            return context$2$0.abrupt('return', { value: value, done: done });

          case 18:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }]);

  return FlattenStream;
})(AsyncStream);

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Bc3luY1N0cmVhbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBT3FCLFdBQVc7V0FBWCxXQUFXOzBCQUFYLFdBQVc7OztlQUFYLFdBQVc7Ozs7Ozs7Ozs7V0FnQnBCOzs7O2tCQUNGLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDOzs7Ozs7O0tBQ3BDOzs7Ozs7Ozs7V0FPUyxjQUFDLE1BQU07Z0JBRU4sS0FBSyxFQUFFLElBQUk7Ozs7Ozs2Q0FBVSxJQUFJLENBQUMsSUFBSSxFQUFFOzs7O0FBQWhDLGlCQUFLLFFBQUwsS0FBSztBQUFFLGdCQUFJLFFBQUosSUFBSTs7aUJBQ2QsSUFBSTs7Ozs7Ozs7OzZDQUVGLE1BQU0sQ0FBQyxLQUFLLENBQUM7Ozs7Ozs7Ozs7O0tBRXRCOzs7Ozs7OztXQU1RO1VBQ0QsR0FBRzs7OztBQUFILGVBQUcsR0FBRyxFQUFFOzs2Q0FDUixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQUEsR0FBRyxFQUFJO0FBQ3JCLGlCQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO2FBQ2QsQ0FBQzs7O2dEQUNLLEdBQUc7Ozs7Ozs7S0FDWDs7Ozs7Ozs7O1dBT0UsYUFBQyxPQUFPLEVBQUU7QUFDWCxhQUFPLElBQUksU0FBUyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtLQUNwQzs7Ozs7Ozs7O1dBT0ssZ0JBQUMsU0FBUyxFQUFFO0FBQ2hCLGFBQU8sSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFBO0tBQ3pDOzs7Ozs7Ozs7V0FPUSxtQkFBQyxTQUFTLEVBQUU7QUFDbkIsYUFBTyxJQUFJLGVBQWUsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUE7S0FDNUM7Ozs7Ozs7O1dBTU0sbUJBQUc7QUFDUixhQUFPLElBQUksYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFBO0tBQy9COzs7Ozs7Ozs7V0FPTSxpQkFBQyxXQUFXLEVBQUU7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RSxJQUFJLEVBQUosSUFBSSxFQUFDOzs7Ozs7O0tBQ3JCOzs7U0FkRyxlQUFlO0dBQVMsV0FBVzs7SUFpQm5DLGFBQWE7WUFBYixhQUFhOztBQUNOLFdBRFAsYUFBYSxDQUNMLElBQUksRUFBRTswQkFEZCxhQUFhOztBQUVmLCtCQUZFLGFBQWEsNkNBRVI7QUFDUCxRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNoQixRQUFJLENBQUMsT0FBTyxHQUFHLEVBQUMsSUFBSSxFQUFBLGdCQUFHO0FBQUUsZUFBTyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUMsQ0FBQTtPQUFFLEVBQUMsQ0FBQTtHQUNoRDs7ZUFMRyxhQUFhOztXQU9QO3lCQUNELEtBQUssRUFBRSxJQUFJLFNBRVQsTUFBSyxFQUFFLEtBQUk7Ozs7OzRCQUZFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFO0FBQWxDLGlCQUFLLGlCQUFMLEtBQUs7QUFBRSxnQkFBSSxpQkFBSixJQUFJOztpQkFDZCxJQUFJOzs7Ozs7NkNBQ3NCLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFOzs7O0FBQXJDLGtCQUFLLFNBQUwsS0FBSztBQUFFLGlCQUFJLFNBQUosSUFBSTs7aUJBQ2QsS0FBSTs7Ozs7Z0RBQ0MsRUFBQyxJQUFJLEVBQUosS0FBSSxFQUFDOzs7QUFDZixnQkFBSSxDQUFDLE9BQU8sZ0JBQUcsTUFBSyxDQUFtQixDQUFBOzs2Q0FDMUIsSUFBSSxDQUFDLElBQUksRUFBRTs7Ozs7O2dEQUVqQixFQUFDLEtBQUssRUFBTCxLQUFLLEVBQUUsSUFBSSxFQUFKLElBQUksRUFBQzs7Ozs7OztLQUN2Qjs7O1NBakJHLGFBQWE7R0FBUyxXQUFXIiwiZmlsZSI6IkFzeW5jU3RyZWFtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG5Bc3luY2hyb25vdXMgaXRlcmF0b3IgcHJvdG9jb2wuIEFzeW5jaHJvbm91c2x5IHByb2R1Y2VzIGEgc3RyZWFtIG9mIHZhbHVlcyBvbiBkZW1hbmQuXG5Bc3luY1N0cmVhbXMgYXJlIG11dGFibGUgb2JqZWN0cywgbWVhbmluZyB0aGV5IGNhbiBvbmx5IGJlIHVzZWQgb25jZS5cblxuVW5saWtlIGEgc2VyaWVzIG9mIGV2ZW50cywgdGhpcyBkb2Vzbid0IHByb2R1Y2UgdGhlIG5leHQgdmFsdWUgdW5sZXNzIGFza2VkIHRvLFxubWFraW5nIGZ1bmN0aW9ucyBsaWtlIHtAbGluayBBc3luY1N0cmVhbSN0YWtlV2hpbGV9IHBvc3NpYmxlLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFzeW5jU3RyZWFtIHtcbiAgLyoqXG4gIENyZWF0ZXMgYW4gQXN5bmNTdHJlYW0gZnJvbSBhbnkgW2l0ZXJhYmxlXShcbiAgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvSXRlcmF0aW9uX3Byb3RvY29scyNpdGVyYWJsZSkuXG4gICovXG4gIHN0YXRpYyBmcm9tSXRlcmFibGUoaXRlcikge1xuICAgIHJldHVybiBuZXcgSXRlcmF0b3JTdHJlYW0oaXRlcltTeW1ib2wuaXRlcmF0b3JdKCkpXG4gIH1cblxuICAvKipcbiAgVGhpcyB3b3JrcyBsaWtlIGFuIGFzeW5jIHZlcnNpb24gb2YgdGhlIFtpdGVyYXRvciBwcm90b2NvbF0oXG4gIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0l0ZXJhdGlvbl9wcm90b2NvbHMjaXRlcmF0b3IpLlxuICBAYWJzdHJhY3RcbiAgQHJldHVybiB7UHJvbWlzZTx7dmFsdWUsIGRvbmU6IGJvb2xlYW59Pn1cbiAgICBJZiBgZG9uZWAsIGB2YWx1ZWAgc2hvdWxkIGJlIGlnbm9yZWQuXG4gICovXG4gIGFzeW5jIG5leHQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQuJylcbiAgfVxuXG4gIC8qKlxuICBQZXJmb3JtIGFuIGFjdGlvbiBmb3IgZWFjaCB2YWx1ZSBpbiB0aGUgc3RyZWFtLlxuICBAcGFyYW0ge2Z1bmN0aW9uKGVsZW0pOiB2b2lkfSBkb0VhY2hcbiAgQHJldHVybiB7UHJvbWlzZTx2b2lkPn1cbiAgKi9cbiAgYXN5bmMgZWFjaChkb0VhY2gpIHtcbiAgICBmb3IgKDs7KSB7XG4gICAgICBjb25zdCB7dmFsdWUsIGRvbmV9ID0gYXdhaXQgdGhpcy5uZXh0KClcbiAgICAgIGlmIChkb25lKVxuICAgICAgICBicmVha1xuICAgICAgYXdhaXQgZG9FYWNoKHZhbHVlKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICBDb2xsZWN0IGV2ZXJ5IHZhbHVlIGludG8gYW4gQXJyYXkuXG4gIEByZXR1cm4ge1Byb21pc2U8QXJyYXk+fVxuICAqL1xuICBhc3luYyBhbGwoKSB7XG4gICAgY29uc3QgYWxsID0gW11cbiAgICBhd2FpdCB0aGlzLmVhY2godmFsID0+IHtcbiAgICAgIGFsbC5wdXNoKHZhbClcbiAgICB9KVxuICAgIHJldHVybiBhbGxcbiAgfVxuXG4gIC8qKlxuICBMYXppbHkgYXBwbGllcyBgbWFwRnVuY2AgdG8gZXZlcnkgdmFsdWUuXG4gIEBwYXJhbSB7ZnVuY3Rpb24oZWxlbSl9IG1hcEZ1bmNcbiAgQHJldHVybiB7QXN5bmNTdHJlYW19XG4gICovXG4gIG1hcChtYXBGdW5jKSB7XG4gICAgcmV0dXJuIG5ldyBNYXBTdHJlYW0odGhpcywgbWFwRnVuYylcbiAgfVxuXG4gIC8qKlxuICBMYXppbHkgcmVtb3ZlcyBlbGVtZW50cyBub3Qgc2F0aXNmeWluZyBgcHJlZGljYXRlYC5cbiAgQHBhcmFtIHtmdW5jdGlvbihlbGVtKTogYm9vbGVhbn0gcHJlZGljYXRlXG4gIEByZXR1cm4ge0FzeW5jU3RyZWFtfVxuICAqL1xuICBmaWx0ZXIocHJlZGljYXRlKSB7XG4gICAgcmV0dXJuIG5ldyBGaWx0ZXJTdHJlYW0odGhpcywgcHJlZGljYXRlKVxuICB9XG5cbiAgLyoqXG4gIEVuZHMgdGhlIHN0cmVhbSBhdCB0aGUgZmlyc3QgZWxlbWVudCBub3Qgc2F0aXNmeWluZyBgcHJlZGljYXRlYC5cbiAgQHBhcmFtIHtmdW5jdGlvbihlbGVtKTogYm9vbGVhbn0gcHJlZGljYXRlXG4gIEByZXR1cm4ge0FzeW5jU3RyZWFtfVxuICAqL1xuICB0YWtlV2hpbGUocHJlZGljYXRlKSB7XG4gICAgcmV0dXJuIG5ldyBUYWtlV2hpbGVTdHJlYW0odGhpcywgcHJlZGljYXRlKVxuICB9XG5cbiAgLyoqXG4gIEFzc3VtaW5nIHRoYXQgdGhpcyBzdHJlYW0ncyBlbGVtZW50cyBhcmUgaXRlcmFibGUsIHJldHVybnMgdGhlIGNvbmNhdGVuYXRpb24gb2YgdGhlaXIgY29udGVudHMuXG4gIEByZXR1cm4ge0FzeW5jU3RyZWFtfVxuICAqL1xuICBmbGF0dGVuKCkge1xuICAgIHJldHVybiBuZXcgRmxhdHRlblN0cmVhbSh0aGlzKVxuICB9XG5cbiAgLyoqXG4gIEFwcGxpZXMgJ2ZsYXRNYXBGdW5jJyB0byBlYWNoIGVsZW1lbnQgYW5kIGNvbmNhdGVuYXRlcyB0aGUgcmVzdWx0cy5cbiAgQHBhcmFtIHtmdW5jdGlvbihlbGVtKTogaXRlcmFibGV9IGZsYXRNYXBGdW5jXG4gIEByZXR1cm4ge0FzeW5jU3RyZWFtfVxuICAqL1xuICBmbGF0TWFwKGZsYXRNYXBGdW5jKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZsYXRNYXBGdW5jKS5mbGF0dGVuKClcbiAgfVxufVxuXG5jbGFzcyBJdGVyYXRvclN0cmVhbSBleHRlbmRzIEFzeW5jU3RyZWFtIHtcbiAgY29uc3RydWN0b3IoaXRlcmF0b3IpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5pdGVyYXRvciA9IGl0ZXJhdG9yXG4gIH1cblxuICBuZXh0KCkge1xuICAgIHJldHVybiB0aGlzLml0ZXJhdG9yLm5leHQoKVxuICB9XG59XG5cbmNsYXNzIE1hcFN0cmVhbSBleHRlbmRzIEFzeW5jU3RyZWFtIHtcbiAgY29uc3RydWN0b3IoYmFzZSwgbWFwRnVuYykge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmJhc2UgPSBiYXNlXG4gICAgdGhpcy5tYXBGdW5jID0gbWFwRnVuY1xuICB9XG5cbiAgYXN5bmMgbmV4dCgpIHtcbiAgICBjb25zdCB7dmFsdWUsIGRvbmV9ID0gYXdhaXQgdGhpcy5iYXNlLm5leHQoKVxuICAgIGlmIChkb25lKVxuICAgICAgcmV0dXJuIHtkb25lfVxuICAgIGVsc2VcbiAgICAgIHJldHVybiB7dmFsdWU6IGF3YWl0IHRoaXMubWFwRnVuYyh2YWx1ZSksIGRvbmV9XG4gIH1cbn1cblxuY2xhc3MgRmlsdGVyU3RyZWFtIGV4dGVuZHMgQXN5bmNTdHJlYW0ge1xuICBjb25zdHJ1Y3RvcihiYXNlLCBwcmVkaWNhdGUpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5iYXNlID0gYmFzZVxuICAgIHRoaXMucHJlZGljYXRlID0gcHJlZGljYXRlXG4gIH1cblxuICBhc3luYyBuZXh0KCkge1xuICAgIGZvciAoOzspIHtcbiAgICAgIGNvbnN0IHt2YWx1ZSwgZG9uZX0gPSBhd2FpdCB0aGlzLmJhc2UubmV4dCgpXG4gICAgICBpZiAoZG9uZSlcbiAgICAgICAgcmV0dXJuIHtkb25lfVxuICAgICAgaWYgKGF3YWl0IHRoaXMucHJlZGljYXRlKHZhbHVlKSlcbiAgICAgICAgcmV0dXJuIHt2YWx1ZSwgZG9uZX1cbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgVGFrZVdoaWxlU3RyZWFtIGV4dGVuZHMgQXN5bmNTdHJlYW0ge1xuICBjb25zdHJ1Y3RvcihiYXNlLCBwcmVkaWNhdGUpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5iYXNlID0gYmFzZVxuICAgIHRoaXMucHJlZGljYXRlID0gcHJlZGljYXRlXG4gIH1cblxuICBhc3luYyBuZXh0KCkge1xuICAgIGNvbnN0IHt2YWx1ZSwgZG9uZX0gPSBhd2FpdCB0aGlzLmJhc2UubmV4dCgpXG4gICAgaWYgKGRvbmUpXG4gICAgICByZXR1cm4ge2RvbmV9XG4gICAgaWYgKCEoYXdhaXQgdGhpcy5wcmVkaWNhdGUodmFsdWUpKSlcbiAgICAgIHJldHVybiB7ZG9uZTogdHJ1ZX1cbiAgICByZXR1cm4ge3ZhbHVlLCBkb25lfVxuICB9XG59XG5cbmNsYXNzIEZsYXR0ZW5TdHJlYW0gZXh0ZW5kcyBBc3luY1N0cmVhbSB7XG4gIGNvbnN0cnVjdG9yKGJhc2UpIHtcbiAgICBzdXBlcigpXG4gICAgdGhpcy5iYXNlID0gYmFzZVxuICAgIHRoaXMuY3VySXRlciA9IHtuZXh0KCkgeyByZXR1cm4ge2RvbmU6IHRydWV9IH19XG4gIH1cblxuICBhc3luYyBuZXh0KCkge1xuICAgIGNvbnN0IHt2YWx1ZSwgZG9uZX0gPSB0aGlzLmN1ckl0ZXIubmV4dCgpXG4gICAgaWYgKGRvbmUpIHtcbiAgICAgIGNvbnN0IHt2YWx1ZSwgZG9uZX0gPSBhd2FpdCB0aGlzLmJhc2UubmV4dCgpXG4gICAgICBpZiAoZG9uZSlcbiAgICAgICAgcmV0dXJuIHtkb25lfVxuICAgICAgdGhpcy5jdXJJdGVyID0gdmFsdWVbU3ltYm9sLml0ZXJhdG9yXSgpXG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy5uZXh0KClcbiAgICB9IGVsc2VcbiAgICAgIHJldHVybiB7dmFsdWUsIGRvbmV9XG4gIH1cbn1cbiJdfQ==