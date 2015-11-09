'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _errors = require('../errors');

var _objects = require('../objects');

/**
 * A Codec sits inside a {@link Field} in a {@link Model} and prepares data for database storage.
 *
 * Encoded values must be JSON data: objects, lists, numbers, {@link Ref}s and {@link Set}s.
 *
 * A field without a Codec must store only JSON data.
 *
 * Input data may be sanitized (e.g. RefCodec converts strings to {@link Ref}s),
 * so there is no guarantee that `codec.decode(codec.encode(value)) === value`.
 */

var Codec = (function () {
  function Codec() {
    _classCallCheck(this, Codec);
  }

  /**
   * Codec for a field whose value is always a {@link Ref}.
   * Also converts any strings coming in to {@link Ref}s.
   */

  _createClass(Codec, [{
    key: 'decode',

    /**
     * Converts a value from the database into a more usable object.
     *
     * (The value taken from the database will already have {@link Ref}s and {@link Set}s converted.)
     * @abstract
     */
    value: function decode() {
      throw new Error('Not implemented.');
    }

    /**
     * Converts a value to prepare for storage in the database.
     * @abstract
     */
  }, {
    key: 'encode',
    value: function encode() {
      throw new Error('Not implemented.');
    }
  }]);

  return Codec;
})();

exports['default'] = Codec;
var RefCodec = {
  inspect: function inspect() {
    return 'RefCodec';
  },

  decode: function decode(ref) {
    return ref;
  },

  encode: function encode(value) {
    if (value === null) return null;else if (typeof value === 'string') return new _objects.Ref(value);else if (value instanceof _objects.Ref) return value;else throw new _errors.InvalidValue('Expected a Ref, got: ' + value);
  }
};
exports.RefCodec = RefCodec;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9Db2RlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O3NCQUEyQixXQUFXOzt1QkFDcEIsWUFBWTs7Ozs7Ozs7Ozs7OztJQVlULEtBQUs7V0FBTCxLQUFLOzBCQUFMLEtBQUs7Ozs7Ozs7O2VBQUwsS0FBSzs7Ozs7Ozs7O1dBT2xCLGtCQUFHO0FBQUUsWUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO0tBQUU7Ozs7Ozs7O1dBSzFDLGtCQUFHO0FBQUUsWUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO0tBQUU7OztTQVo3QixLQUFLOzs7cUJBQUwsS0FBSztBQW1CbkIsSUFBTSxRQUFRLEdBQUc7QUFDdEIsU0FBTyxFQUFBLG1CQUFHO0FBQUUsV0FBTyxVQUFVLENBQUE7R0FBRTs7QUFFL0IsUUFBTSxFQUFBLGdCQUFDLEdBQUcsRUFBRTtBQUNWLFdBQU8sR0FBRyxDQUFBO0dBQ1g7O0FBRUQsUUFBTSxFQUFBLGdCQUFDLEtBQUssRUFBRTtBQUNaLFFBQUksS0FBSyxLQUFLLElBQUksRUFDaEIsT0FBTyxJQUFJLENBQUEsS0FDUixJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFDaEMsT0FBTyxpQkFBUSxLQUFLLENBQUMsQ0FBQSxLQUNsQixJQUFJLEtBQUssd0JBQWUsRUFDM0IsT0FBTyxLQUFLLENBQUEsS0FFWixNQUFNLG1EQUF5QyxLQUFLLENBQUcsQ0FBQTtHQUMxRDtDQUNGLENBQUEiLCJmaWxlIjoiQ29kZWMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0ludmFsaWRWYWx1ZX0gZnJvbSAnLi4vZXJyb3JzJ1xuaW1wb3J0IHtSZWZ9IGZyb20gJy4uL29iamVjdHMnXG5cbi8qKlxuICogQSBDb2RlYyBzaXRzIGluc2lkZSBhIHtAbGluayBGaWVsZH0gaW4gYSB7QGxpbmsgTW9kZWx9IGFuZCBwcmVwYXJlcyBkYXRhIGZvciBkYXRhYmFzZSBzdG9yYWdlLlxuICpcbiAqIEVuY29kZWQgdmFsdWVzIG11c3QgYmUgSlNPTiBkYXRhOiBvYmplY3RzLCBsaXN0cywgbnVtYmVycywge0BsaW5rIFJlZn1zIGFuZCB7QGxpbmsgU2V0fXMuXG4gKlxuICogQSBmaWVsZCB3aXRob3V0IGEgQ29kZWMgbXVzdCBzdG9yZSBvbmx5IEpTT04gZGF0YS5cbiAqXG4gKiBJbnB1dCBkYXRhIG1heSBiZSBzYW5pdGl6ZWQgKGUuZy4gUmVmQ29kZWMgY29udmVydHMgc3RyaW5ncyB0byB7QGxpbmsgUmVmfXMpLFxuICogc28gdGhlcmUgaXMgbm8gZ3VhcmFudGVlIHRoYXQgYGNvZGVjLmRlY29kZShjb2RlYy5lbmNvZGUodmFsdWUpKSA9PT0gdmFsdWVgLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb2RlYyB7XG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIHZhbHVlIGZyb20gdGhlIGRhdGFiYXNlIGludG8gYSBtb3JlIHVzYWJsZSBvYmplY3QuXG4gICAqXG4gICAqIChUaGUgdmFsdWUgdGFrZW4gZnJvbSB0aGUgZGF0YWJhc2Ugd2lsbCBhbHJlYWR5IGhhdmUge0BsaW5rIFJlZn1zIGFuZCB7QGxpbmsgU2V0fXMgY29udmVydGVkLilcbiAgICogQGFic3RyYWN0XG4gICAqL1xuICBkZWNvZGUoKSB7IHRocm93IG5ldyBFcnJvcignTm90IGltcGxlbWVudGVkLicpIH1cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgdmFsdWUgdG8gcHJlcGFyZSBmb3Igc3RvcmFnZSBpbiB0aGUgZGF0YWJhc2UuXG4gICAqIEBhYnN0cmFjdFxuICAgKi9cbiAgZW5jb2RlKCkgeyB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZC4nKSB9XG59XG5cbi8qKlxuICogQ29kZWMgZm9yIGEgZmllbGQgd2hvc2UgdmFsdWUgaXMgYWx3YXlzIGEge0BsaW5rIFJlZn0uXG4gKiBBbHNvIGNvbnZlcnRzIGFueSBzdHJpbmdzIGNvbWluZyBpbiB0byB7QGxpbmsgUmVmfXMuXG4gKi9cbmV4cG9ydCBjb25zdCBSZWZDb2RlYyA9IHtcbiAgaW5zcGVjdCgpIHsgcmV0dXJuICdSZWZDb2RlYycgfSxcblxuICBkZWNvZGUocmVmKSB7XG4gICAgcmV0dXJuIHJlZlxuICB9LFxuXG4gIGVuY29kZSh2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PT0gbnVsbClcbiAgICAgIHJldHVybiBudWxsXG4gICAgZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJylcbiAgICAgIHJldHVybiBuZXcgUmVmKHZhbHVlKVxuICAgIGVsc2UgaWYgKHZhbHVlIGluc3RhbmNlb2YgUmVmKVxuICAgICAgcmV0dXJuIHZhbHVlXG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEludmFsaWRWYWx1ZShgRXhwZWN0ZWQgYSBSZWYsIGdvdDogJHt2YWx1ZX1gKVxuICB9XG59XG4iXX0=