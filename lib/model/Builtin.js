'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _objects = require('../objects');

var _query = require('../query');

var query = _interopRequireWildcard(_query);

var _Codec = require('./Codec');

var _Model2 = require('./Model');

var _Model3 = _interopRequireDefault(_Model2);

/**
 * Builtins are special classes that exist by default.
 * If you want to store custom data, you can add new fields with e.g. `Database.addField`.
 */

var Builtin = (function (_Model) {
  _inherits(Builtin, _Model);

  function Builtin() {
    _classCallCheck(this, Builtin);

    _get(Object.getPrototypeOf(Builtin.prototype), 'constructor', this).apply(this, arguments);
  }

  /** See the [docs](https://faunadb.com/documentation/objects#databases). */

  _createClass(Builtin, null, [{
    key: 'setup',

    /** @private */
    value: function setup() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _get(Object.getPrototypeOf(Builtin), 'setup', this).apply(this, args);
      (0, _assert2['default'])(!this.isAbstract());
      // classRef does not have 'classes' in front
      this.classRef = new _objects.Ref(this.faunaClassName);
      for (var fieldName in this.fields) {
        // Builtin fields do not have 'data' in front of path
        this.fields[fieldName].path = [fieldName];
      }
    }
  }]);

  return Builtin;
})(_Model3['default']);

exports['default'] = Builtin;

var Database = (function (_Builtin) {
  _inherits(Database, _Builtin);

  function Database() {
    _classCallCheck(this, Database);

    _get(Object.getPrototypeOf(Database.prototype), 'constructor', this).apply(this, arguments);
  }

  return Database;
})(Builtin);

exports.Database = Database;

Database.setup('databases', { name: {}, api_version: {} });

/** See the [docs](https://faunadb.com/documentation/objects#keys). */

var Key = (function (_Builtin2) {
  _inherits(Key, _Builtin2);

  function Key() {
    _classCallCheck(this, Key);

    _get(Object.getPrototypeOf(Key.prototype), 'constructor', this).apply(this, arguments);
  }

  return Key;
})(Builtin);

exports.Key = Key;

Key.setup('keys', {
  database: { codec: _Codec.RefCodec },
  role: {},
  secret: {},
  hashed_secret: {}
});

/** See the [docs](https://faunadb.com/documentation/objects#classes). */

var Class = (function (_Builtin3) {
  _inherits(Class, _Builtin3);

  function Class() {
    _classCallCheck(this, Class);

    _get(Object.getPrototypeOf(Class.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Class, null, [{
    key: 'createForModel',

    /**
     * Creates a Class for the {@link Model} class.
     * @param {Client} client
     * @param {Function} modelClass
     * @param {Object} data Field values for the Class object.
     * @return {Promise<Class>}
     */
    value: function createForModel(client, modelClass) {
      var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
      return _regeneratorRuntime.async(function createForModel$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this.create(client, _Object$assign({ name: modelClass.faunaClassName }, data)));

          case 2:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 3:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }

    /**
     * Gets the Class associated with a {@link Model} class.
     * @param {Client} client
     * @param {Function} modelClass
     * @return {Promise<Class>}
     */
  }, {
    key: 'getForModel',
    value: function getForModel(client, modelClass) {
      return _regeneratorRuntime.async(function getForModel$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this.get(client, modelClass.classRef));

          case 2:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 3:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }]);

  return Class;
})(Builtin);

exports.Class = Class;

Class.setup('classes', {
  name: {},
  history_days: {},
  ttl_days: {},
  permissions: {}
});

/** See the [docs](https://faunadb.com/documentation/objects#indexes). */

var Index = (function (_Builtin4) {
  _inherits(Index, _Builtin4);

  function Index() {
    _classCallCheck(this, Index);

    _get(Object.getPrototypeOf(Index.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Index, [{
    key: 'match',

    /**
     * Set query representing all instances whose value matches the index's term.
     *
     * See also {@link Model.pageIndex} and {@link Model.streamIndex}.
     * @param matchedValues For each of `this.terms`, a value to match it.
     * @return {object} A query set made by {@link match}.
     */
    value: function match() {
      for (var _len2 = arguments.length, matchedValues = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        matchedValues[_key2] = arguments[_key2];
      }

      // Make query slightly neater by only using array if necessary.
      if (matchedValues.length === 1) matchedValues = matchedValues[0];
      return query.match(matchedValues, this.ref);
    }

    /**
     * Returns raw data of the first instance matched by this index.
     * Typically this will be used for an index with `unique: true`.
     * See also {@link Model.getFromIndex}.
     * @param matchedValues Same as for {@link match}.
     * @return {Promise<Object>}
     */
  }, {
    key: 'getSingle',
    value: function getSingle() {
      var args$2$0 = arguments;
      return _regeneratorRuntime.async(function getSingle$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this.client.query(query.get(this.match.apply(this, args$2$0))));

          case 2:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 3:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }], [{
    key: 'createForModel',

    /**
     * Creates an Index for a {@link Model} class.
     * The index may not be usable immediately. See the docs.
     * @param {Client} client
     * @param {Function} modelClass
     * @param {string} name
     * @param {string|Array<{path: string}>} terms
     * @param {Object} data Field values for the Index object.
     * @return {Promise<Index>}
     */
    value: function createForModel(client, modelClass, name, terms) {
      var data = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];
      var source;
      return _regeneratorRuntime.async(function createForModel$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (typeof terms === 'string') terms = [{ path: 'data.' + terms }];
            context$2$0.next = 3;
            return _regeneratorRuntime.awrap(Class.getForModel(client, modelClass));

          case 3:
            source = context$2$0.sent;
            context$2$0.next = 6;
            return _regeneratorRuntime.awrap(this.create(client, _Object$assign({ source: source.ref, name: name, terms: terms }, data)));

          case 6:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 7:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }]);

  return Index;
})(Builtin);

exports.Index = Index;

Index.setup('indexes', {
  name: {},
  source: { codec: _Codec.RefCodec },
  terms: {},
  values: {},
  unique: {},
  permissions: {},
  active: {}
});

/**
 * Index over all instances of a class.
 * Not a different faunadb class; just a specialized Index.
 */

var ClassIndex = (function (_Index) {
  _inherits(ClassIndex, _Index);

  function ClassIndex() {
    _classCallCheck(this, ClassIndex);

    _get(Object.getPrototypeOf(ClassIndex.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ClassIndex, [{
    key: 'match',

    /**
     * Query set of all instances of the class.
     * @return {object} A query set made by {@link match}.
     */
    value: function match() {
      return query.match(this.getEncoded('source'), this.ref);
    }
  }], [{
    key: 'createForModel',

    /**
     * Creates a class index for the given model.
     * If the model is `classes/xyz`, the class index will be `indexes/xyz`.
     * @param {Client} client
     * @param {Function} modelClass
     * @param {Object} data Field values for the ClassIndex object.
     * @return {Promise<ClassIndex>}
     */
    value: function createForModel(client, modelClass) {
      var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
      var name, source, terms;
      return _regeneratorRuntime.async(function createForModel$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            name = modelClass.faunaClassName;
            context$2$0.next = 3;
            return _regeneratorRuntime.awrap(Class.getForModel(client, modelClass));

          case 3:
            source = context$2$0.sent;
            terms = [{ path: 'class' }];
            context$2$0.next = 7;
            return _regeneratorRuntime.awrap(ClassIndex.create(client, _Object$assign({ source: source.ref, name: name, terms: terms }, data)));

          case 7:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 8:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }

    /**
     * Fetches the class index.
     * @param {Client} client
     * @param {Function} modelClass
     * @return {Promise<ClassIndex>}
     */
  }, {
    key: 'getForModel',
    value: function getForModel(client, modelClass) {
      return _regeneratorRuntime.async(function getForModel$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(ClassIndex.getById(client, modelClass.faunaClassName));

          case 2:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 3:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }]);

  return ClassIndex;
})(Index);

exports.ClassIndex = ClassIndex;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9CdWlsdGluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBQW1CLFFBQVE7Ozs7dUJBQ1QsWUFBWTs7cUJBQ1AsVUFBVTs7SUFBckIsS0FBSzs7cUJBQ00sU0FBUzs7c0JBQ2QsU0FBUzs7Ozs7Ozs7O0lBTU4sT0FBTztZQUFQLE9BQU87O1dBQVAsT0FBTzswQkFBUCxPQUFPOzsrQkFBUCxPQUFPOzs7OztlQUFQLE9BQU87Ozs7V0FFZCxpQkFBVTt3Q0FBTixJQUFJO0FBQUosWUFBSTs7O0FBQ2xCLGlDQUhpQixPQUFPLDhCQUdULElBQUksRUFBQztBQUNwQiwrQkFBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFBOztBQUUxQixVQUFJLENBQUMsUUFBUSxHQUFHLGlCQUFRLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQTtBQUM1QyxXQUFLLElBQU0sU0FBUyxJQUFJLElBQUksQ0FBQyxNQUFNOztBQUVqQyxZQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFBO09BQUE7S0FDNUM7OztTQVZrQixPQUFPOzs7cUJBQVAsT0FBTzs7SUFjZixRQUFRO1lBQVIsUUFBUTs7V0FBUixRQUFROzBCQUFSLFFBQVE7OytCQUFSLFFBQVE7OztTQUFSLFFBQVE7R0FBUyxPQUFPOzs7O0FBQ3JDLFFBQVEsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEVBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFDLENBQUMsQ0FBQTs7OztJQUczQyxHQUFHO1lBQUgsR0FBRzs7V0FBSCxHQUFHOzBCQUFILEdBQUc7OytCQUFILEdBQUc7OztTQUFILEdBQUc7R0FBUyxPQUFPOzs7O0FBQ2hDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO0FBQ2hCLFVBQVEsRUFBRSxFQUFDLEtBQUssaUJBQVUsRUFB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QUcsQ0FBQyxDQUFBO0tBQ3hEOzs7Ozs7Ozs7Ozs7V0F2QjBCLHdCQUFDLE1BQU0sRUFBRSxVQUFVO1VBQUUsSUFBSSx5REFBQyxFQUFFO1VBQy9DLElBQUksRUFDSixNQUFNLEVBQ04sS0FBSzs7OztBQUZMLGdCQUFJLEdBQUcsVUFBVSxDQUFDLGNBQWM7OzZDQUNqQixLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUM7OztBQUFwRCxrQkFBTTtBQUNOLGlCQUFLLEdBQUcsQ0FBQyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUMsQ0FBQzs7NkNBQ2xCLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLGVBQWMsRUFBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUosSUFBSSxFQUFFLEtBQUssRUFBTCxLQUFLLEVBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQzs7Ozs7Ozs7OztLQUMvRjs7Ozs7Ozs7OztXQVF1QixxQkFBQyxNQUFNLEVBQUUsVUFBVTs7Ozs7NkNBQzVCLFVBQVUsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxjQUFjLENBQUM7Ozs7Ozs7Ozs7S0FDbkU7OztTQXhCVSxVQUFVO0dBQVMsS0FBSyIsImZpbGUiOiJCdWlsdGluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnXG5pbXBvcnQge1JlZn0gZnJvbSAnLi4vb2JqZWN0cydcbmltcG9ydCAqIGFzIHF1ZXJ5IGZyb20gJy4uL3F1ZXJ5J1xuaW1wb3J0IHtSZWZDb2RlY30gZnJvbSAnLi9Db2RlYydcbmltcG9ydCBNb2RlbCBmcm9tICcuL01vZGVsJ1xuXG4vKipcbiAqIEJ1aWx0aW5zIGFyZSBzcGVjaWFsIGNsYXNzZXMgdGhhdCBleGlzdCBieSBkZWZhdWx0LlxuICogSWYgeW91IHdhbnQgdG8gc3RvcmUgY3VzdG9tIGRhdGEsIHlvdSBjYW4gYWRkIG5ldyBmaWVsZHMgd2l0aCBlLmcuIGBEYXRhYmFzZS5hZGRGaWVsZGAuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJ1aWx0aW4gZXh0ZW5kcyBNb2RlbCB7XG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBzdGF0aWMgc2V0dXAoLi4uYXJncykge1xuICAgIHN1cGVyLnNldHVwKC4uLmFyZ3MpXG4gICAgYXNzZXJ0KCF0aGlzLmlzQWJzdHJhY3QoKSlcbiAgICAvLyBjbGFzc1JlZiBkb2VzIG5vdCBoYXZlICdjbGFzc2VzJyBpbiBmcm9udFxuICAgIHRoaXMuY2xhc3NSZWYgPSBuZXcgUmVmKHRoaXMuZmF1bmFDbGFzc05hbWUpXG4gICAgZm9yIChjb25zdCBmaWVsZE5hbWUgaW4gdGhpcy5maWVsZHMpXG4gICAgICAvLyBCdWlsdGluIGZpZWxkcyBkbyBub3QgaGF2ZSAnZGF0YScgaW4gZnJvbnQgb2YgcGF0aFxuICAgICAgdGhpcy5maWVsZHNbZmllbGROYW1lXS5wYXRoID0gW2ZpZWxkTmFtZV1cbiAgfVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL29iamVjdHMjZGF0YWJhc2VzKS4gKi9cbmV4cG9ydCBjbGFzcyBEYXRhYmFzZSBleHRlbmRzIEJ1aWx0aW4geyB9XG5EYXRhYmFzZS5zZXR1cCgnZGF0YWJhc2VzJywge25hbWU6IHt9LCBhcGlfdmVyc2lvbjoge319KVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL29iamVjdHMja2V5cykuICovXG5leHBvcnQgY2xhc3MgS2V5IGV4dGVuZHMgQnVpbHRpbiB7IH1cbktleS5zZXR1cCgna2V5cycsIHtcbiAgZGF0YWJhc2U6IHtjb2RlYzogUmVmQ29kZWN9LFxuICByb2xlOiB7fSxcbiAgc2VjcmV0OiB7fSxcbiAgaGFzaGVkX3NlY3JldDoge31cbn0pXG5cbi8qKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vb2JqZWN0cyNjbGFzc2VzKS4gKi9cbmV4cG9ydCBjbGFzcyBDbGFzcyBleHRlbmRzIEJ1aWx0aW4ge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIENsYXNzIGZvciB0aGUge0BsaW5rIE1vZGVsfSBjbGFzcy5cbiAgICogQHBhcmFtIHtDbGllbnR9IGNsaWVudFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBtb2RlbENsYXNzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIEZpZWxkIHZhbHVlcyBmb3IgdGhlIENsYXNzIG9iamVjdC5cbiAgICogQHJldHVybiB7UHJvbWlzZTxDbGFzcz59XG4gICAqL1xuICBzdGF0aWMgYXN5bmMgY3JlYXRlRm9yTW9kZWwoY2xpZW50LCBtb2RlbENsYXNzLCBkYXRhPXt9KSB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuY3JlYXRlKGNsaWVudCwgT2JqZWN0LmFzc2lnbih7bmFtZTogbW9kZWxDbGFzcy5mYXVuYUNsYXNzTmFtZX0sIGRhdGEpKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIENsYXNzIGFzc29jaWF0ZWQgd2l0aCBhIHtAbGluayBNb2RlbH0gY2xhc3MuXG4gICAqIEBwYXJhbSB7Q2xpZW50fSBjbGllbnRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbW9kZWxDbGFzc1xuICAgKiBAcmV0dXJuIHtQcm9taXNlPENsYXNzPn1cbiAgICovXG4gIHN0YXRpYyBhc3luYyBnZXRGb3JNb2RlbChjbGllbnQsIG1vZGVsQ2xhc3MpIHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXQoY2xpZW50LCBtb2RlbENsYXNzLmNsYXNzUmVmKVxuICB9XG59XG5DbGFzcy5zZXR1cCgnY2xhc3NlcycsIHtcbiAgbmFtZToge30sXG4gIGhpc3RvcnlfZGF5czoge30sXG4gIHR0bF9kYXlzOiB7fSxcbiAgcGVybWlzc2lvbnM6IHt9XG59KVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL29iamVjdHMjaW5kZXhlcykuICovXG5leHBvcnQgY2xhc3MgSW5kZXggZXh0ZW5kcyBCdWlsdGluIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gSW5kZXggZm9yIGEge0BsaW5rIE1vZGVsfSBjbGFzcy5cbiAgICogVGhlIGluZGV4IG1heSBub3QgYmUgdXNhYmxlIGltbWVkaWF0ZWx5LiBTZWUgdGhlIGRvY3MuXG4gICAqIEBwYXJhbSB7Q2xpZW50fSBjbGllbnRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbW9kZWxDbGFzc1xuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ3xBcnJheTx7cGF0aDogc3RyaW5nfT59IHRlcm1zXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIEZpZWxkIHZhbHVlcyBmb3IgdGhlIEluZGV4IG9iamVjdC5cbiAgICogQHJldHVybiB7UHJvbWlzZTxJbmRleD59XG4gICAqL1xuICBzdGF0aWMgYXN5bmMgY3JlYXRlRm9yTW9kZWwoY2xpZW50LCBtb2RlbENsYXNzLCBuYW1lLCB0ZXJtcywgZGF0YT17fSkge1xuICAgIGlmICh0eXBlb2YgdGVybXMgPT09ICdzdHJpbmcnKVxuICAgICAgdGVybXMgPSBbe3BhdGg6IGBkYXRhLiR7dGVybXN9YH1dXG4gICAgY29uc3Qgc291cmNlID0gYXdhaXQgQ2xhc3MuZ2V0Rm9yTW9kZWwoY2xpZW50LCBtb2RlbENsYXNzKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmNyZWF0ZShjbGllbnQsIE9iamVjdC5hc3NpZ24oe3NvdXJjZTogc291cmNlLnJlZiwgbmFtZSwgdGVybXN9LCBkYXRhKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgcXVlcnkgcmVwcmVzZW50aW5nIGFsbCBpbnN0YW5jZXMgd2hvc2UgdmFsdWUgbWF0Y2hlcyB0aGUgaW5kZXgncyB0ZXJtLlxuICAgKlxuICAgKiBTZWUgYWxzbyB7QGxpbmsgTW9kZWwucGFnZUluZGV4fSBhbmQge0BsaW5rIE1vZGVsLnN0cmVhbUluZGV4fS5cbiAgICogQHBhcmFtIG1hdGNoZWRWYWx1ZXMgRm9yIGVhY2ggb2YgYHRoaXMudGVybXNgLCBhIHZhbHVlIHRvIG1hdGNoIGl0LlxuICAgKiBAcmV0dXJuIHtvYmplY3R9IEEgcXVlcnkgc2V0IG1hZGUgYnkge0BsaW5rIG1hdGNofS5cbiAgICovXG4gIG1hdGNoKC4uLm1hdGNoZWRWYWx1ZXMpIHtcbiAgICAvLyBNYWtlIHF1ZXJ5IHNsaWdodGx5IG5lYXRlciBieSBvbmx5IHVzaW5nIGFycmF5IGlmIG5lY2Vzc2FyeS5cbiAgICBpZiAobWF0Y2hlZFZhbHVlcy5sZW5ndGggPT09IDEpXG4gICAgICBtYXRjaGVkVmFsdWVzID0gbWF0Y2hlZFZhbHVlc1swXVxuICAgIHJldHVybiBxdWVyeS5tYXRjaChtYXRjaGVkVmFsdWVzLCB0aGlzLnJlZilcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHJhdyBkYXRhIG9mIHRoZSBmaXJzdCBpbnN0YW5jZSBtYXRjaGVkIGJ5IHRoaXMgaW5kZXguXG4gICAqIFR5cGljYWxseSB0aGlzIHdpbGwgYmUgdXNlZCBmb3IgYW4gaW5kZXggd2l0aCBgdW5pcXVlOiB0cnVlYC5cbiAgICogU2VlIGFsc28ge0BsaW5rIE1vZGVsLmdldEZyb21JbmRleH0uXG4gICAqIEBwYXJhbSBtYXRjaGVkVmFsdWVzIFNhbWUgYXMgZm9yIHtAbGluayBtYXRjaH0uXG4gICAqIEByZXR1cm4ge1Byb21pc2U8T2JqZWN0Pn1cbiAgICovXG4gIGFzeW5jIGdldFNpbmdsZSguLi5tYXRjaGVkVmFsdWVzKSB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuY2xpZW50LnF1ZXJ5KHF1ZXJ5LmdldCh0aGlzLm1hdGNoKC4uLm1hdGNoZWRWYWx1ZXMpKSlcbiAgfVxufVxuSW5kZXguc2V0dXAoJ2luZGV4ZXMnLCB7XG4gIG5hbWU6IHt9LFxuICBzb3VyY2U6IHtjb2RlYzogUmVmQ29kZWN9LFxuICB0ZXJtczoge30sXG4gIHZhbHVlczoge30sXG4gIHVuaXF1ZToge30sXG4gIHBlcm1pc3Npb25zOiB7fSxcbiAgYWN0aXZlOiB7fVxufSlcblxuLyoqXG4gKiBJbmRleCBvdmVyIGFsbCBpbnN0YW5jZXMgb2YgYSBjbGFzcy5cbiAqIE5vdCBhIGRpZmZlcmVudCBmYXVuYWRiIGNsYXNzOyBqdXN0IGEgc3BlY2lhbGl6ZWQgSW5kZXguXG4gKi9cbmV4cG9ydCBjbGFzcyBDbGFzc0luZGV4IGV4dGVuZHMgSW5kZXgge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIGNsYXNzIGluZGV4IGZvciB0aGUgZ2l2ZW4gbW9kZWwuXG4gICAqIElmIHRoZSBtb2RlbCBpcyBgY2xhc3Nlcy94eXpgLCB0aGUgY2xhc3MgaW5kZXggd2lsbCBiZSBgaW5kZXhlcy94eXpgLlxuICAgKiBAcGFyYW0ge0NsaWVudH0gY2xpZW50XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG1vZGVsQ2xhc3NcbiAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgRmllbGQgdmFsdWVzIGZvciB0aGUgQ2xhc3NJbmRleCBvYmplY3QuXG4gICAqIEByZXR1cm4ge1Byb21pc2U8Q2xhc3NJbmRleD59XG4gICAqL1xuICBzdGF0aWMgYXN5bmMgY3JlYXRlRm9yTW9kZWwoY2xpZW50LCBtb2RlbENsYXNzLCBkYXRhPXt9KSB7XG4gICAgY29uc3QgbmFtZSA9IG1vZGVsQ2xhc3MuZmF1bmFDbGFzc05hbWVcbiAgICBjb25zdCBzb3VyY2UgPSBhd2FpdCBDbGFzcy5nZXRGb3JNb2RlbChjbGllbnQsIG1vZGVsQ2xhc3MpXG4gICAgY29uc3QgdGVybXMgPSBbe3BhdGg6ICdjbGFzcyd9XVxuICAgIHJldHVybiBhd2FpdCBDbGFzc0luZGV4LmNyZWF0ZShjbGllbnQsIE9iamVjdC5hc3NpZ24oe3NvdXJjZTogc291cmNlLnJlZiwgbmFtZSwgdGVybXN9LCBkYXRhKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaGVzIHRoZSBjbGFzcyBpbmRleC5cbiAgICogQHBhcmFtIHtDbGllbnR9IGNsaWVudFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBtb2RlbENsYXNzXG4gICAqIEByZXR1cm4ge1Byb21pc2U8Q2xhc3NJbmRleD59XG4gICAqL1xuICBzdGF0aWMgYXN5bmMgZ2V0Rm9yTW9kZWwoY2xpZW50LCBtb2RlbENsYXNzKSB7XG4gICAgcmV0dXJuIGF3YWl0IENsYXNzSW5kZXguZ2V0QnlJZChjbGllbnQsIG1vZGVsQ2xhc3MuZmF1bmFDbGFzc05hbWUpXG4gIH1cblxuICAvKipcbiAgICogUXVlcnkgc2V0IG9mIGFsbCBpbnN0YW5jZXMgb2YgdGhlIGNsYXNzLlxuICAgKiBAcmV0dXJuIHtvYmplY3R9IEEgcXVlcnkgc2V0IG1hZGUgYnkge0BsaW5rIG1hdGNofS5cbiAgICovXG4gIG1hdGNoKCkge1xuICAgIHJldHVybiBxdWVyeS5tYXRjaCh0aGlzLmdldEVuY29kZWQoJ3NvdXJjZScpLCB0aGlzLnJlZilcbiAgfVxufVxuIl19