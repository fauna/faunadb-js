'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _Object$defineProperty = require('babel-runtime/core-js/object/define-property')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _errors = require('../errors');

var _objects = require('../objects');

var _PageStream = require('../PageStream');

var _PageStream2 = _interopRequireDefault(_PageStream);

var _query = require('../query');

var query = _interopRequireWildcard(_query);

var _util = require('../_util');

var _Field = require('./Field');

var _Field2 = _interopRequireDefault(_Field);

var _util2 = require('./_util');

/**
 * Base class for all models.
 *
 * Models represent database instances.
 * They link a FaunaDB class to a JavaScript class.
 *
 * The basic format is:
 *
 *     class MyModel extends Model {
 *       ... your methods ...
 *     }
 *     // define class name and fields
 *     MyModel.setup('my_models', {
 *       x: {},
 *       y: {converter: new RefConverter(MyModel)}
 *     })
 *
 * {@link Field}s will be constructed and
 * properties will be generated for each field passed to {@link setup}.
 *
 * {@link Class.createForModel} must be called before you can save model instances.
 */

var Model = (function () {
  _createClass(Model, null, [{
    key: 'setup',

    /**
     * @param {string} faunaClassName
     * @param {object} fields
     *   Each `key: value` pair is the parameters for `addField`.
     */
    value: function setup(faunaClassName) {
      var fields = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this.faunaClassName = faunaClassName;
      /**
       * {@link Ref} for the class itself.
       *
       * `instance.ref` should be the same as `new Ref(instance.constructor.classRef, instance.id)`.
       */
      this.classRef = new _objects.Ref('classes', faunaClassName);
      /** Object of all fields assigned to this class. */
      this.fields = {};
      for (var fieldName in fields) {
        this.addField(fieldName, fields[fieldName]);
      }
    }

    /**
     * Adds a new field to the class, making getters and setters.
     *
     * @param {string} fieldName
     *   Name for the field. A getter and setter will be made with this name.
     *   If `fieldOpts.path` is not defined, it defaults to `['data', fieldName]`.
     * @param {object} fieldOpts
     *   Parameters for the {@link Field} constructor.
     */
  }, {
    key: 'addField',
    value: function addField(fieldName) {
      var fieldOpts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      if (fieldName === 'ref' || fieldName === 'ts') throw new Error('Forbidden field name.');

      if (fieldOpts.path == null) fieldOpts.path = ['data', fieldName];
      var field = new _Field2['default'](fieldOpts);
      this.fields[fieldName] = field;

      var _ref = field.codec === null ? {
        get: function get() {
          return (0, _util2.getPath)(field.path, this._current);
        },
        set: function set(value) {
          (0, _util2.setPath)(field.path, value, this._current);
        }
      } : {
        get: function get() {
          var encoded = (0, _util2.getPath)(field.path, this._current);
          var decoded = field.codec.decode(encoded, this);
          return decoded;
        },
        set: function set(value) {
          var encoded = field.codec.encode(value, this);
          (0, _util2.setPath)(field.path, encoded, this._current);
        }
      };

      var get = _ref.get;
      var set = _ref.set;

      _Object$defineProperty(this.prototype, fieldName, { get: get, set: set });
    }

    /**
     * Initialize (but do not save) a new instance.
     * @param {Client} client
     * @param {object} data Fields values for the new instance.
     */
  }]);

  function Model(client, data) {
    _classCallCheck(this, Model);

    /** Client instance that the model uses to save to the database. */
    this.client = client;

    this._original = {};
    this._initState();

    for (var fieldName in data) {
      if (!(fieldName in this.constructor.fields)) throw new _errors.InvalidValue('No such field ' + fieldName);
      // This calls the field's setter.
      this[fieldName] = data[fieldName];
    }
  }

  /** Lambda expression for getting an instance Ref out of a match result. */

  /** {@link Ref} of this instance in the database. `null` if {@link isNewInstance}. */

  _createClass(Model, [{
    key: 'getEncoded',

    /** For a field with a {@link Converter}, gets the encoded value. */
    value: function getEncoded(fieldName) {
      var field = this.constructor.fields[fieldName];
      return (0, _util2.getPath)(field.path, this._current);
    }

    /** `false` if this has ever been saved to the database. */
  }, {
    key: 'isNewInstance',
    value: function isNewInstance() {
      return !('ref' in this._current);
    }

    /**
     * Removes this instance from the database.
     * @return {Promise<Object>}
     */
  }, {
    key: 'delete',
    value: function _delete() {
      return _regeneratorRuntime.async(function _delete$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this.client.query(this.deleteQuery()));

          case 2:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 3:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }

    /**
     * Query that deletes this instance.
     * @return {Object} A {@link delete_expr} expression.
     */
  }, {
    key: 'deleteQuery',
    value: function deleteQuery() {
      if (this.isNewInstance()) throw new _errors.InvalidQuery('Instance does not exist in the database.');
      return query.delete_expr(this.ref);
    }

    /**
     * Executes {@link saveQuery}.
     * @param replace Same as for {@link saveQuery}.
     * @return {Promise<void>}
     */
  }, {
    key: 'save',
    value: function save() {
      var replace = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
      return _regeneratorRuntime.async(function save$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.t0 = this;
            context$2$0.next = 3;
            return _regeneratorRuntime.awrap(this.client.query(this.saveQuery(replace)));

          case 3:
            context$2$0.t1 = context$2$0.sent;

            context$2$0.t0._initFromResource.call(context$2$0.t0, context$2$0.t1);

          case 5:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }

    /**
     * Query to save this instance to the database.
     * If {@link isNewInstance}, creates it and sets `ref` and `ts`.
     * Otherwise, updates any changed fields.
     *
     * @param replace
     *   If true, updates will update *all* fields
     *   using {@link replaceQuery} instead of {@link updateQuery}.
     *   See the [docs](https://faunadb.com/documentation/queries#write_functions).
     * @return {Object} A query expression, ready to use with {@link Client#query}.
     */
  }, {
    key: 'saveQuery',
    value: function saveQuery() {
      var replace = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      return this.isNewInstance() ? this.createQuery() : replace ? this.replaceQuery() : this.updateQuery();
    }

    /**
     * Query to create a new instance.
     * @return {Object} A {@link create} expression.
     */
  }, {
    key: 'createQuery',
    value: function createQuery() {
      if (!this.isNewInstance()) throw new _errors.InvalidQuery('Trying to create instance that has already been created.');
      return query.create(this.constructor.classRef, query.quote(this._current));
    }

    /**
     * Query to replace this instance's data.
     * @return {Object} A {@link replace} expression.
     */
  }, {
    key: 'replaceQuery',
    value: function replaceQuery() {
      if (this.isNewInstance()) throw new _errors.InvalidQuery('Instance has not yet been created.');
      return query.replace(this.ref, query.quote(this._current));
    }

    /**
     * Query to update this instance's data.
     * @return {Object} a {@link update} expression.
     */
  }, {
    key: 'updateQuery',
    value: function updateQuery() {
      if (this.isNewInstance()) throw new _errors.InvalidQuery('Instance has not yet been created.');
      return query.update(this.ref, query.quote(this._diff()));
    }

    /** A Model class is considered abstract if {@link setup} was never called. */
  }, {
    key: '_initFromResource',
    value: function _initFromResource(resource) {
      if (!(typeof resource === 'object' && resource.constructor === Object)) throw new Error('Expected to initialize from plain object resource.');
      var expectedClass = this.constructor.classRef;
      if (!(resource['class'] instanceof _objects.Ref) || !resource['class'].equals(expectedClass)) throw new _errors.InvalidValue('Trying to initialize from resource of class ' + resource['class'] + '; expected ' + expectedClass);

      this._original = resource;
      this._initState();
    }
  }, {
    key: '_initState',
    value: function _initState() {
      // New JSON data of the instance.
      this._current = (0, _util2.objectDup)(this._original);
    }
  }, {
    key: '_diff',
    value: function _diff() {
      return (0, _util2.calculateDiff)(this._original, this._current);
    }

    /**
     * Paginates a set query and converts results to instances of this class.
     *
     * @param {Client} client
     * @param instanceSet Query set of instances of this class.
     * @param pageParams Params to {@link paginate}.
     * @return {Promise<Page<this>>} Page whose elements are instances of this class.
     */
  }, {
    key: 'toString',

    /** @ignore */
    value: function toString() {
      var _this = this;

      var fields = _Object$keys(this.constructor.fields).map(function (key) {
        return key + ': ' + _this[key];
      }).join(', ');
      return this.constructor.name + '(' + fields + ')';
    }
  }, {
    key: 'ref',
    get: function get() {
      var ref = this._current.ref;
      return ref === undefined ? null : ref;
    }

    /** The id portion of this instance's {@link Ref}. Fails if {@link isNewInstance}. */
  }, {
    key: 'id',
    get: function get() {
      return this.ref === null ? null : this.ref.id;
    }

    /**
     * Microsecond UNIX timestamp of the latest {@link save}.
     * `null` if {@link isNewInstance}.
     */
  }, {
    key: 'ts',
    get: function get() {
      var ts = this._current.ts;
      return ts === undefined ? null : ts;
    }
  }], [{
    key: 'isAbstract',
    value: function isAbstract() {
      return this.faunaClassName === undefined;
    }

    /**
     * Gets the instance of this class specified by `ref`.
     * @param {Client} client
     * @param {Ref} ref Must be a reference to an instance of this class.
     * @return {Promise<this>} An instance of this class.
     */
  }, {
    key: 'get',
    value: function get(client, ref) {
      return _regeneratorRuntime.async(function get$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.t0 = this;
            context$2$0.t1 = client;
            context$2$0.next = 4;
            return _regeneratorRuntime.awrap(client.get(ref));

          case 4:
            context$2$0.t2 = context$2$0.sent;
            return context$2$0.abrupt('return', context$2$0.t0.getFromResource.call(context$2$0.t0, context$2$0.t1, context$2$0.t2));

          case 6:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }

    /**
     * Gets the instance of this class specified by `id`.
     * @param {Client} client
     * @param {number|string} instanceId `id` portion of a {@link Ref} for an instance of this class.
     * @return {Promise<this>} An instance of this class.
     */
  }, {
    key: 'getById',
    value: function getById(client, instanceId) {
      return _regeneratorRuntime.async(function getById$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this.get(client, new _objects.Ref(this.classRef, instanceId)));

          case 2:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 3:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }

    /**
     * Initializes and saves a new instance.
     * @param {Client} client
     * @param {Object} data Field values for the new instance.
     * @return {Promise<this>} An instance of this class.
     */
  }, {
    key: 'create',
    value: function create(client) {
      var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var instance;
      return _regeneratorRuntime.async(function create$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            instance = new this(client, data);
            context$2$0.t0 = instance;
            context$2$0.next = 4;
            return _regeneratorRuntime.awrap(client.post(this.classRef, instance._current));

          case 4:
            context$2$0.t1 = context$2$0.sent;

            context$2$0.t0._initFromResource.call(context$2$0.t0, context$2$0.t1);

            return context$2$0.abrupt('return', instance);

          case 7:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }

    /**
     * Creates a new instance from query results.
     *
     * See also {@link get}.
     * @param {Client} client
     * @param {Object} resource Raw instance data, usually the result of a query.
     * @return {this} An instance of this class.
     */
  }, {
    key: 'getFromResource',
    value: function getFromResource(client, resource) {
      var instance = new this(client);
      instance._initFromResource(resource);
      return instance;
    }
  }, {
    key: 'page',
    value: function page(client, instanceSet) {
      var pageParams = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
      return _regeneratorRuntime.async(function page$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.next = 2;
            return _regeneratorRuntime.awrap(this._mapPage(client, instanceSet, query.get, pageParams));

          case 2:
            return context$2$0.abrupt('return', context$2$0.sent);

          case 3:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }

    /**
     * Calls {@link Index#match} and then works just like {@link page}.
     *
     * @param {Index} index
     * @param matchedValues Values for {@link Index.match}.
     * @param pageParams Params to {@link query.paginate}.
     * @return {Promise<Page<this>>} Page whose elements are instances of this class.
     */
  }, {
    key: 'pageIndex',
    value: function pageIndex(index, matchedValues) {
      var pageParams = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
      var client, matchSet, getter;
      return _regeneratorRuntime.async(function pageIndex$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (!(matchedValues instanceof Array)) matchedValues = [matchedValues];
            client = index.client;
            matchSet = index.match.apply(index, _toConsumableArray(matchedValues));
            getter = indexRefGetter(index);
            return context$2$0.abrupt('return', this._mapPage(client, matchSet, getter, pageParams));

          case 5:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: '_mapPage',
    value: function _mapPage(client, instanceSet, pageLambda, pageParams) {
      var pageQuery, mapQuery, page;
      return _regeneratorRuntime.async(function _mapPage$(context$2$0) {
        var _this2 = this;

        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            pageQuery = query.paginate(instanceSet, pageParams);
            mapQuery = query.map(pageLambda, pageQuery);
            context$2$0.t0 = _objects.Page;
            context$2$0.next = 5;
            return _regeneratorRuntime.awrap(client.query(mapQuery));

          case 5:
            context$2$0.t1 = context$2$0.sent;
            page = context$2$0.t0.fromRaw.call(context$2$0.t0, context$2$0.t1);
            return context$2$0.abrupt('return', page.mapData(function (resource) {
              return _this2.getFromResource(client, resource);
            }));

          case 8:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }

    /**
     * Stream for `instanceSet` that converts results to model instances.
     * @param {Client} client
     * @param instanceSet Query set of {@link Ref}s to instances of this class.
     * @param {number} opts.pageSize Size of each page.
     * @return {PageStream<this>} Stream whose elements are instances of this class.
     */
  }, {
    key: 'stream',
    value: function stream(client, instanceSet) {
      var _this3 = this;

      var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var _applyDefaults = (0, _util.applyDefaults)(opts, {
        pageSize: undefined
      });

      var pageSize = _applyDefaults.pageSize;

      return _PageStream2['default'].elements(client, instanceSet, {
        pageSize: pageSize,
        mapLambda: query.get
      }).map(function (instance) {
        return _this3.getFromResource(client, instance);
      });
    }

    /**
     * Calls {@link Index#match} and then works just like {@link pageStream}.
     *
     * @param {Index} index Index whose instances are instances of this class.
     * @param matchedValues Matched value or array of matched values, passed into {@link Index.match}.
     * @param {number} opts.pageSize Size of each page.
     * @return {PageStream<this>} Stream whose elements are instances of this class.
     */
  }, {
    key: 'streamIndex',
    value: function streamIndex(index, matchedValues) {
      var _this4 = this;

      var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var _applyDefaults2 = (0, _util.applyDefaults)(opts, {
        pageSize: undefined
      });

      var pageSize = _applyDefaults2.pageSize;

      var client = index.client;
      if (!(matchedValues instanceof Array)) matchedValues = [matchedValues];
      var matchSet = index.match.apply(index, _toConsumableArray(matchedValues));
      return _PageStream2['default'].elements(client, matchSet, {
        pageSize: pageSize,
        mapLambda: indexRefGetter(index)
      }).map(function (instance) {
        return _this4.getFromResource(client, instance);
      });
    }

    /**
     * Returns the first instance matched by the index.
     * @param {Index} index
     * @param matchedValues Same as for {@link Index.match}.
     * @return {Promise<this>} Instance of this class.
     */
  }, {
    key: 'getFromIndex',
    value: function getFromIndex(index) {
      for (var _len = arguments.length, matchedValues = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        matchedValues[_key - 1] = arguments[_key];
      }

      return _regeneratorRuntime.async(function getFromIndex$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            context$2$0.t0 = this;
            context$2$0.t1 = index.client;
            context$2$0.next = 4;
            return _regeneratorRuntime.awrap(index.getSingle.apply(index, matchedValues));

          case 4:
            context$2$0.t2 = context$2$0.sent;
            return context$2$0.abrupt('return', context$2$0.t0.getFromResource.call(context$2$0.t0, context$2$0.t1, context$2$0.t2));

          case 6:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }]);

  return Model;
})();

exports['default'] = Model;
function indexRefGetter(index) {
  return index.values ? function (arr) {
    return query.get(query.select(index.values.length, arr));
  } : query.get;
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbC9Nb2RlbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3NCQUF5QyxXQUFXOzt1QkFDNUIsWUFBWTs7MEJBQ2IsZUFBZTs7OztxQkFDZixVQUFVOztJQUFyQixLQUFLOztvQkFDVyxVQUFVOztxQkFDcEIsU0FBUzs7OztxQkFDOEIsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQXdCN0MsS0FBSztlQUFMLEtBQUs7Ozs7Ozs7O1dBTVosZUFBQyxjQUFjLEVBQWE7VUFBWCxNQUFNLHlEQUFDLEVBQUU7O0FBQ3BDLFVBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFBOzs7Ozs7QUFNcEMsVUFBSSxDQUFDLFFBQVEsR0FBRyxpQkFBUSxTQUFTLEVBQUUsY0FBYyxDQUFDLENBQUE7O0FBRWxELFVBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFBO0FBQ2hCLFdBQUssSUFBTSxTQUFTLElBQUksTUFBTTtBQUM1QixZQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtPQUFBO0tBQzlDOzs7Ozs7Ozs7Ozs7O1dBV2Msa0JBQUMsU0FBUyxFQUFnQjtVQUFkLFNBQVMseURBQUMsRUFBRTs7QUFDckMsVUFBSSxTQUFTLEtBQUssS0FBSyxJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQzNDLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQTs7QUFFMUMsVUFBSSxTQUFTLENBQUMsSUFBSSxJQUFJLElBQUksRUFDeEIsU0FBUyxDQUFDLElBQUksR0FBRyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQTtBQUN0QyxVQUFNLEtBQUssR0FBRyx1QkFBVSxTQUFTLENBQUMsQ0FBQTtBQUNsQyxVQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEtBQUssQ0FBQTs7aUJBRVgsS0FBSyxDQUFDLEtBQUssS0FBSyxJQUFJ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cFZrQixLQUFLOzs7cUJBQUwsS0FBSztBQStWMUIsU0FBUyxjQUFjLENBQUMsS0FBSyxFQUFFO0FBQzdCLFNBQU8sS0FBSyxDQUFDLE1BQU0sR0FDakIsVUFBQSxHQUFHO1dBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0dBQUEsR0FDeEQsS0FBSyxDQUFDLEdBQUcsQ0FBQTtDQUNaIiwiZmlsZSI6Ik1vZGVsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbnZhbGlkUXVlcnksIEludmFsaWRWYWx1ZX0gZnJvbSAnLi4vZXJyb3JzJ1xuaW1wb3J0IHtQYWdlLCBSZWZ9IGZyb20gJy4uL29iamVjdHMnXG5pbXBvcnQgUGFnZVN0cmVhbSBmcm9tICcuLi9QYWdlU3RyZWFtJ1xuaW1wb3J0ICogYXMgcXVlcnkgZnJvbSAnLi4vcXVlcnknXG5pbXBvcnQge2FwcGx5RGVmYXVsdHN9IGZyb20gJy4uL191dGlsJ1xuaW1wb3J0IEZpZWxkIGZyb20gJy4vRmllbGQnXG5pbXBvcnQge2NhbGN1bGF0ZURpZmYsIGdldFBhdGgsIG9iamVjdER1cCwgc2V0UGF0aH0gZnJvbSAnLi9fdXRpbCdcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBhbGwgbW9kZWxzLlxuICpcbiAqIE1vZGVscyByZXByZXNlbnQgZGF0YWJhc2UgaW5zdGFuY2VzLlxuICogVGhleSBsaW5rIGEgRmF1bmFEQiBjbGFzcyB0byBhIEphdmFTY3JpcHQgY2xhc3MuXG4gKlxuICogVGhlIGJhc2ljIGZvcm1hdCBpczpcbiAqXG4gKiAgICAgY2xhc3MgTXlNb2RlbCBleHRlbmRzIE1vZGVsIHtcbiAqICAgICAgIC4uLiB5b3VyIG1ldGhvZHMgLi4uXG4gKiAgICAgfVxuICogICAgIC8vIGRlZmluZSBjbGFzcyBuYW1lIGFuZCBmaWVsZHNcbiAqICAgICBNeU1vZGVsLnNldHVwKCdteV9tb2RlbHMnLCB7XG4gKiAgICAgICB4OiB7fSxcbiAqICAgICAgIHk6IHtjb252ZXJ0ZXI6IG5ldyBSZWZDb252ZXJ0ZXIoTXlNb2RlbCl9XG4gKiAgICAgfSlcbiAqXG4gKiB7QGxpbmsgRmllbGR9cyB3aWxsIGJlIGNvbnN0cnVjdGVkIGFuZFxuICogcHJvcGVydGllcyB3aWxsIGJlIGdlbmVyYXRlZCBmb3IgZWFjaCBmaWVsZCBwYXNzZWQgdG8ge0BsaW5rIHNldHVwfS5cbiAqXG4gKiB7QGxpbmsgQ2xhc3MuY3JlYXRlRm9yTW9kZWx9IG11c3QgYmUgY2FsbGVkIGJlZm9yZSB5b3UgY2FuIHNhdmUgbW9kZWwgaW5zdGFuY2VzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb2RlbCB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZmF1bmFDbGFzc05hbWVcbiAgICogQHBhcmFtIHtvYmplY3R9IGZpZWxkc1xuICAgKiAgIEVhY2ggYGtleTogdmFsdWVgIHBhaXIgaXMgdGhlIHBhcmFtZXRlcnMgZm9yIGBhZGRGaWVsZGAuXG4gICAqL1xuICBzdGF0aWMgc2V0dXAoZmF1bmFDbGFzc05hbWUsIGZpZWxkcz17fSkge1xuICAgIHRoaXMuZmF1bmFDbGFzc05hbWUgPSBmYXVuYUNsYXNzTmFtZVxuICAgIC8qKlxuICAgICAqIHtAbGluayBSZWZ9IGZvciB0aGUgY2xhc3MgaXRzZWxmLlxuICAgICAqXG4gICAgICogYGluc3RhbmNlLnJlZmAgc2hvdWxkIGJlIHRoZSBzYW1lIGFzIGBuZXcgUmVmKGluc3RhbmNlLmNvbnN0cnVjdG9yLmNsYXNzUmVmLCBpbnN0YW5jZS5pZClgLlxuICAgICAqL1xuICAgIHRoaXMuY2xhc3NSZWYgPSBuZXcgUmVmKCdjbGFzc2VzJywgZmF1bmFDbGFzc05hbWUpXG4gICAgLyoqIE9iamVjdCBvZiBhbGwgZmllbGRzIGFzc2lnbmVkIHRvIHRoaXMgY2xhc3MuICovXG4gICAgdGhpcy5maWVsZHMgPSB7fVxuICAgIGZvciAoY29uc3QgZmllbGROYW1lIGluIGZpZWxkcylcbiAgICAgIHRoaXMuYWRkRmllbGQoZmllbGROYW1lLCBmaWVsZHNbZmllbGROYW1lXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgbmV3IGZpZWxkIHRvIHRoZSBjbGFzcywgbWFraW5nIGdldHRlcnMgYW5kIHNldHRlcnMuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWVsZE5hbWVcbiAgICogICBOYW1lIGZvciB0aGUgZmllbGQuIEEgZ2V0dGVyIGFuZCBzZXR0ZXIgd2lsbCBiZSBtYWRlIHdpdGggdGhpcyBuYW1lLlxuICAgKiAgIElmIGBmaWVsZE9wdHMucGF0aGAgaXMgbm90IGRlZmluZWQsIGl0IGRlZmF1bHRzIHRvIGBbJ2RhdGEnLCBmaWVsZE5hbWVdYC5cbiAgICogQHBhcmFtIHtvYmplY3R9IGZpZWxkT3B0c1xuICAgKiAgIFBhcmFtZXRlcnMgZm9yIHRoZSB7QGxpbmsgRmllbGR9IGNvbnN0cnVjdG9yLlxuICAgKi9cbiAgc3RhdGljIGFkZEZpZWxkKGZpZWxkTmFtZSwgZmllbGRPcHRzPXt9KSB7XG4gICAgaWYgKGZpZWxkTmFtZSA9PT0gJ3JlZicgfHwgZmllbGROYW1lID09PSAndHMnKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGb3JiaWRkZW4gZmllbGQgbmFtZS4nKVxuXG4gICAgaWYgKGZpZWxkT3B0cy5wYXRoID09IG51bGwpXG4gICAgICBmaWVsZE9wdHMucGF0aCA9IFsnZGF0YScsIGZpZWxkTmFtZV1cbiAgICBjb25zdCBmaWVsZCA9IG5ldyBGaWVsZChmaWVsZE9wdHMpXG4gICAgdGhpcy5maWVsZHNbZmllbGROYW1lXSA9IGZpZWxkXG5cbiAgICBjb25zdCB7Z2V0LCBzZXR9ID0gZmllbGQuY29kZWMgPT09IG51bGwgP1xuICAgICAge1xuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIGdldFBhdGgoZmllbGQucGF0aCwgdGhpcy5fY3VycmVudClcbiAgICAgICAgfSxcbiAgICAgICAgc2V0KHZhbHVlKSB7XG4gICAgICAgICAgc2V0UGF0aChmaWVsZC5wYXRoLCB2YWx1ZSwgdGhpcy5fY3VycmVudClcbiAgICAgICAgfVxuICAgICAgfSA6IHtcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIGNvbnN0IGVuY29kZWQgPSBnZXRQYXRoKGZpZWxkLnBhdGgsIHRoaXMuX2N1cnJlbnQpXG4gICAgICAgICAgY29uc3QgZGVjb2RlZCA9IGZpZWxkLmNvZGVjLmRlY29kZShlbmNvZGVkLCB0aGlzKVxuICAgICAgICAgIHJldHVybiBkZWNvZGVkXG4gICAgICAgIH0sXG4gICAgICAgIHNldCh2YWx1ZSkge1xuICAgICAgICAgIGNvbnN0IGVuY29kZWQgPSBmaWVsZC5jb2RlYy5lbmNvZGUodmFsdWUsIHRoaXMpXG4gICAgICAgICAgc2V0UGF0aChmaWVsZC5wYXRoLCBlbmNvZGVkLCB0aGlzLl9jdXJyZW50KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMucHJvdG90eXBlLCBmaWVsZE5hbWUsIHtnZXQsIHNldH0pXG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSAoYnV0IGRvIG5vdCBzYXZlKSBhIG5ldyBpbnN0YW5jZS5cbiAgICogQHBhcmFtIHtDbGllbnR9IGNsaWVudFxuICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSBGaWVsZHMgdmFsdWVzIGZvciB0aGUgbmV3IGluc3RhbmNlLlxuICAgKi9cbiAgY29uc3RydWN0b3IoY2xpZW50LCBkYXRhKSB7XG4gICAgLyoqIENsaWVudCBpbnN0YW5jZSB0aGF0IHRoZSBtb2RlbCB1c2VzIHRvIHNhdmUgdG8gdGhlIGRhdGFiYXNlLiAqL1xuICAgIHRoaXMuY2xpZW50ID0gY2xpZW50XG5cbiAgICB0aGlzLl9vcmlnaW5hbCA9IHt9XG4gICAgdGhpcy5faW5pdFN0YXRlKClcblxuICAgIGZvciAoY29uc3QgZmllbGROYW1lIGluIGRhdGEpIHtcbiAgICAgIGlmICghKGZpZWxkTmFtZSBpbiB0aGlzLmNvbnN0cnVjdG9yLmZpZWxkcykpXG4gICAgICAgIHRocm93IG5ldyBJbnZhbGlkVmFsdWUoYE5vIHN1Y2ggZmllbGQgJHtmaWVsZE5hbWV9YClcbiAgICAgIC8vIFRoaXMgY2FsbHMgdGhlIGZpZWxkJ3Mgc2V0dGVyLlxuICAgICAgdGhpc1tmaWVsZE5hbWVdID0gZGF0YVtmaWVsZE5hbWVdXG4gICAgfVxuICB9XG5cbiAgLyoqIHtAbGluayBSZWZ9IG9mIHRoaXMgaW5zdGFuY2UgaW4gdGhlIGRhdGFiYXNlLiBgbnVsbGAgaWYge0BsaW5rIGlzTmV3SW5zdGFuY2V9LiAqL1xuICBnZXQgcmVmKCkge1xuICAgIGNvbnN0IHJlZiA9IHRoaXMuX2N1cnJlbnQucmVmXG4gICAgcmV0dXJuIHJlZiA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IHJlZlxuICB9XG5cbiAgLyoqIFRoZSBpZCBwb3J0aW9uIG9mIHRoaXMgaW5zdGFuY2UncyB7QGxpbmsgUmVmfS4gRmFpbHMgaWYge0BsaW5rIGlzTmV3SW5zdGFuY2V9LiAqL1xuICBnZXQgaWQoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVmID09PSBudWxsID8gbnVsbCA6IHRoaXMucmVmLmlkXG4gIH1cblxuICAvKipcbiAgICogTWljcm9zZWNvbmQgVU5JWCB0aW1lc3RhbXAgb2YgdGhlIGxhdGVzdCB7QGxpbmsgc2F2ZX0uXG4gICAqIGBudWxsYCBpZiB7QGxpbmsgaXNOZXdJbnN0YW5jZX0uXG4gICAqL1xuICBnZXQgdHMoKSB7XG4gICAgY29uc3QgdHMgPSB0aGlzLl9jdXJyZW50LnRzXG4gICAgcmV0dXJuIHRzID09PSB1bmRlZmluZWQgPyBudWxsIDogdHNcbiAgfVxuXG4gIC8qKiBGb3IgYSBmaWVsZCB3aXRoIGEge0BsaW5rIENvbnZlcnRlcn0sIGdldHMgdGhlIGVuY29kZWQgdmFsdWUuICovXG4gIGdldEVuY29kZWQoZmllbGROYW1lKSB7XG4gICAgY29uc3QgZmllbGQgPSB0aGlzLmNvbnN0cnVjdG9yLmZpZWxkc1tmaWVsZE5hbWVdXG4gICAgcmV0dXJuIGdldFBhdGgoZmllbGQucGF0aCwgdGhpcy5fY3VycmVudClcbiAgfVxuXG4gIC8qKiBgZmFsc2VgIGlmIHRoaXMgaGFzIGV2ZXIgYmVlbiBzYXZlZCB0byB0aGUgZGF0YWJhc2UuICovXG4gIGlzTmV3SW5zdGFuY2UoKSB7XG4gICAgcmV0dXJuICEoJ3JlZicgaW4gdGhpcy5fY3VycmVudClcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIHRoaXMgaW5zdGFuY2UgZnJvbSB0aGUgZGF0YWJhc2UuXG4gICAqIEByZXR1cm4ge1Byb21pc2U8T2JqZWN0Pn1cbiAgICovXG4gIGFzeW5jIGRlbGV0ZSgpIHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5jbGllbnQucXVlcnkodGhpcy5kZWxldGVRdWVyeSgpKVxuICB9XG5cbiAgLyoqXG4gICAqIFF1ZXJ5IHRoYXQgZGVsZXRlcyB0aGlzIGluc3RhbmNlLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IEEge0BsaW5rIGRlbGV0ZV9leHByfSBleHByZXNzaW9uLlxuICAgKi9cbiAgZGVsZXRlUXVlcnkoKSB7XG4gICAgaWYgKHRoaXMuaXNOZXdJbnN0YW5jZSgpKVxuICAgICAgdGhyb3cgbmV3IEludmFsaWRRdWVyeSgnSW5zdGFuY2UgZG9lcyBub3QgZXhpc3QgaW4gdGhlIGRhdGFiYXNlLicpXG4gICAgcmV0dXJuIHF1ZXJ5LmRlbGV0ZV9leHByKHRoaXMucmVmKVxuICB9XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGVzIHtAbGluayBzYXZlUXVlcnl9LlxuICAgKiBAcGFyYW0gcmVwbGFjZSBTYW1lIGFzIGZvciB7QGxpbmsgc2F2ZVF1ZXJ5fS5cbiAgICogQHJldHVybiB7UHJvbWlzZTx2b2lkPn1cbiAgICovXG4gIGFzeW5jIHNhdmUocmVwbGFjZT1mYWxzZSkge1xuICAgIHRoaXMuX2luaXRGcm9tUmVzb3VyY2UoYXdhaXQgdGhpcy5jbGllbnQucXVlcnkodGhpcy5zYXZlUXVlcnkocmVwbGFjZSkpKVxuICB9XG5cbiAgLyoqXG4gICAqIFF1ZXJ5IHRvIHNhdmUgdGhpcyBpbnN0YW5jZSB0byB0aGUgZGF0YWJhc2UuXG4gICAqIElmIHtAbGluayBpc05ld0luc3RhbmNlfSwgY3JlYXRlcyBpdCBhbmQgc2V0cyBgcmVmYCBhbmQgYHRzYC5cbiAgICogT3RoZXJ3aXNlLCB1cGRhdGVzIGFueSBjaGFuZ2VkIGZpZWxkcy5cbiAgICpcbiAgICogQHBhcmFtIHJlcGxhY2VcbiAgICogICBJZiB0cnVlLCB1cGRhdGVzIHdpbGwgdXBkYXRlICphbGwqIGZpZWxkc1xuICAgKiAgIHVzaW5nIHtAbGluayByZXBsYWNlUXVlcnl9IGluc3RlYWQgb2Yge0BsaW5rIHVwZGF0ZVF1ZXJ5fS5cbiAgICogICBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcXVlcmllcyN3cml0ZV9mdW5jdGlvbnMpLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IEEgcXVlcnkgZXhwcmVzc2lvbiwgcmVhZHkgdG8gdXNlIHdpdGgge0BsaW5rIENsaWVudCNxdWVyeX0uXG4gICAqL1xuICBzYXZlUXVlcnkocmVwbGFjZT1mYWxzZSkge1xuICAgIHJldHVybiB0aGlzLmlzTmV3SW5zdGFuY2UoKSA/XG4gICAgICB0aGlzLmNyZWF0ZVF1ZXJ5KCkgOlxuICAgICAgcmVwbGFjZSA/IHRoaXMucmVwbGFjZVF1ZXJ5KCkgOiB0aGlzLnVwZGF0ZVF1ZXJ5KClcbiAgfVxuXG4gIC8qKlxuICAgKiBRdWVyeSB0byBjcmVhdGUgYSBuZXcgaW5zdGFuY2UuXG4gICAqIEByZXR1cm4ge09iamVjdH0gQSB7QGxpbmsgY3JlYXRlfSBleHByZXNzaW9uLlxuICAgKi9cbiAgY3JlYXRlUXVlcnkoKSB7XG4gICAgaWYgKCF0aGlzLmlzTmV3SW5zdGFuY2UoKSlcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUXVlcnkoJ1RyeWluZyB0byBjcmVhdGUgaW5zdGFuY2UgdGhhdCBoYXMgYWxyZWFkeSBiZWVuIGNyZWF0ZWQuJylcbiAgICByZXR1cm4gcXVlcnkuY3JlYXRlKHRoaXMuY29uc3RydWN0b3IuY2xhc3NSZWYsIHF1ZXJ5LnF1b3RlKHRoaXMuX2N1cnJlbnQpKVxuICB9XG5cbiAgLyoqXG4gICAqIFF1ZXJ5IHRvIHJlcGxhY2UgdGhpcyBpbnN0YW5jZSdzIGRhdGEuXG4gICAqIEByZXR1cm4ge09iamVjdH0gQSB7QGxpbmsgcmVwbGFjZX0gZXhwcmVzc2lvbi5cbiAgICovXG4gIHJlcGxhY2VRdWVyeSgpIHtcbiAgICBpZiAodGhpcy5pc05ld0luc3RhbmNlKCkpXG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFF1ZXJ5KCdJbnN0YW5jZSBoYXMgbm90IHlldCBiZWVuIGNyZWF0ZWQuJylcbiAgICByZXR1cm4gcXVlcnkucmVwbGFjZSh0aGlzLnJlZiwgcXVlcnkucXVvdGUodGhpcy5fY3VycmVudCkpXG4gIH1cblxuICAvKipcbiAgICogUXVlcnkgdG8gdXBkYXRlIHRoaXMgaW5zdGFuY2UncyBkYXRhLlxuICAgKiBAcmV0dXJuIHtPYmplY3R9IGEge0BsaW5rIHVwZGF0ZX0gZXhwcmVzc2lvbi5cbiAgICovXG4gIHVwZGF0ZVF1ZXJ5KCkge1xuICAgIGlmICh0aGlzLmlzTmV3SW5zdGFuY2UoKSlcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkUXVlcnkoJ0luc3RhbmNlIGhhcyBub3QgeWV0IGJlZW4gY3JlYXRlZC4nKVxuICAgIHJldHVybiBxdWVyeS51cGRhdGUodGhpcy5yZWYsIHF1ZXJ5LnF1b3RlKHRoaXMuX2RpZmYoKSkpXG4gIH1cblxuICAvKiogQSBNb2RlbCBjbGFzcyBpcyBjb25zaWRlcmVkIGFic3RyYWN0IGlmIHtAbGluayBzZXR1cH0gd2FzIG5ldmVyIGNhbGxlZC4gKi9cbiAgc3RhdGljIGlzQWJzdHJhY3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuZmF1bmFDbGFzc05hbWUgPT09IHVuZGVmaW5lZFxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGluc3RhbmNlIG9mIHRoaXMgY2xhc3Mgc3BlY2lmaWVkIGJ5IGByZWZgLlxuICAgKiBAcGFyYW0ge0NsaWVudH0gY2xpZW50XG4gICAqIEBwYXJhbSB7UmVmfSByZWYgTXVzdCBiZSBhIHJlZmVyZW5jZSB0byBhbiBpbnN0YW5jZSBvZiB0aGlzIGNsYXNzLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlPHRoaXM+fSBBbiBpbnN0YW5jZSBvZiB0aGlzIGNsYXNzLlxuICAgKi9cbiAgc3RhdGljIGFzeW5jIGdldChjbGllbnQsIHJlZikge1xuICAgIHJldHVybiB0aGlzLmdldEZyb21SZXNvdXJjZShjbGllbnQsIGF3YWl0IGNsaWVudC5nZXQocmVmKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBpbnN0YW5jZSBvZiB0aGlzIGNsYXNzIHNwZWNpZmllZCBieSBgaWRgLlxuICAgKiBAcGFyYW0ge0NsaWVudH0gY2xpZW50XG4gICAqIEBwYXJhbSB7bnVtYmVyfHN0cmluZ30gaW5zdGFuY2VJZCBgaWRgIHBvcnRpb24gb2YgYSB7QGxpbmsgUmVmfSBmb3IgYW4gaW5zdGFuY2Ugb2YgdGhpcyBjbGFzcy5cbiAgICogQHJldHVybiB7UHJvbWlzZTx0aGlzPn0gQW4gaW5zdGFuY2Ugb2YgdGhpcyBjbGFzcy5cbiAgICovXG4gIHN0YXRpYyBhc3luYyBnZXRCeUlkKGNsaWVudCwgaW5zdGFuY2VJZCkge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldChjbGllbnQsIG5ldyBSZWYodGhpcy5jbGFzc1JlZiwgaW5zdGFuY2VJZCkpXG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgYW5kIHNhdmVzIGEgbmV3IGluc3RhbmNlLlxuICAgKiBAcGFyYW0ge0NsaWVudH0gY2xpZW50XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIEZpZWxkIHZhbHVlcyBmb3IgdGhlIG5ldyBpbnN0YW5jZS5cbiAgICogQHJldHVybiB7UHJvbWlzZTx0aGlzPn0gQW4gaW5zdGFuY2Ugb2YgdGhpcyBjbGFzcy5cbiAgICovXG4gIHN0YXRpYyBhc3luYyBjcmVhdGUoY2xpZW50LCBkYXRhPXt9KSB7XG4gICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgdGhpcyhjbGllbnQsIGRhdGEpXG4gICAgaW5zdGFuY2UuX2luaXRGcm9tUmVzb3VyY2UoYXdhaXQgY2xpZW50LnBvc3QodGhpcy5jbGFzc1JlZiwgaW5zdGFuY2UuX2N1cnJlbnQpKVxuICAgIHJldHVybiBpbnN0YW5jZVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2UgZnJvbSBxdWVyeSByZXN1bHRzLlxuICAgKlxuICAgKiBTZWUgYWxzbyB7QGxpbmsgZ2V0fS5cbiAgICogQHBhcmFtIHtDbGllbnR9IGNsaWVudFxuICAgKiBAcGFyYW0ge09iamVjdH0gcmVzb3VyY2UgUmF3IGluc3RhbmNlIGRhdGEsIHVzdWFsbHkgdGhlIHJlc3VsdCBvZiBhIHF1ZXJ5LlxuICAgKiBAcmV0dXJuIHt0aGlzfSBBbiBpbnN0YW5jZSBvZiB0aGlzIGNsYXNzLlxuICAgKi9cbiAgc3RhdGljIGdldEZyb21SZXNvdXJjZShjbGllbnQsIHJlc291cmNlKSB7XG4gICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgdGhpcyhjbGllbnQpXG4gICAgaW5zdGFuY2UuX2luaXRGcm9tUmVzb3VyY2UocmVzb3VyY2UpXG4gICAgcmV0dXJuIGluc3RhbmNlXG4gIH1cblxuICBfaW5pdEZyb21SZXNvdXJjZShyZXNvdXJjZSkge1xuICAgIGlmICghKHR5cGVvZiByZXNvdXJjZSA9PT0gJ29iamVjdCcgJiYgcmVzb3VyY2UuY29uc3RydWN0b3IgPT09IE9iamVjdCkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIHRvIGluaXRpYWxpemUgZnJvbSBwbGFpbiBvYmplY3QgcmVzb3VyY2UuJylcbiAgICBjb25zdCBleHBlY3RlZENsYXNzID0gdGhpcy5jb25zdHJ1Y3Rvci5jbGFzc1JlZlxuICAgIGlmICghKHJlc291cmNlLmNsYXNzIGluc3RhbmNlb2YgUmVmKSB8fCAhcmVzb3VyY2UuY2xhc3MuZXF1YWxzKGV4cGVjdGVkQ2xhc3MpKVxuICAgICAgdGhyb3cgbmV3IEludmFsaWRWYWx1ZShcbiAgICAgICAgYFRyeWluZyB0byBpbml0aWFsaXplIGZyb20gcmVzb3VyY2Ugb2YgY2xhc3MgJHtyZXNvdXJjZS5jbGFzc307IGV4cGVjdGVkICR7ZXhwZWN0ZWRDbGFzc31gKVxuXG4gICAgdGhpcy5fb3JpZ2luYWwgPSByZXNvdXJjZVxuICAgIHRoaXMuX2luaXRTdGF0ZSgpXG4gIH1cblxuICBfaW5pdFN0YXRlKCkge1xuICAgIC8vIE5ldyBKU09OIGRhdGEgb2YgdGhlIGluc3RhbmNlLlxuICAgIHRoaXMuX2N1cnJlbnQgPSBvYmplY3REdXAodGhpcy5fb3JpZ2luYWwpXG4gIH1cblxuICBfZGlmZigpIHtcbiAgICByZXR1cm4gY2FsY3VsYXRlRGlmZih0aGlzLl9vcmlnaW5hbCwgdGhpcy5fY3VycmVudClcbiAgfVxuXG4gIC8qKlxuICAgKiBQYWdpbmF0ZXMgYSBzZXQgcXVlcnkgYW5kIGNvbnZlcnRzIHJlc3VsdHMgdG8gaW5zdGFuY2VzIG9mIHRoaXMgY2xhc3MuXG4gICAqXG4gICAqIEBwYXJhbSB7Q2xpZW50fSBjbGllbnRcbiAgICogQHBhcmFtIGluc3RhbmNlU2V0IFF1ZXJ5IHNldCBvZiBpbnN0YW5jZXMgb2YgdGhpcyBjbGFzcy5cbiAgICogQHBhcmFtIHBhZ2VQYXJhbXMgUGFyYW1zIHRvIHtAbGluayBwYWdpbmF0ZX0uXG4gICAqIEByZXR1cm4ge1Byb21pc2U8UGFnZTx0aGlzPj59IFBhZ2Ugd2hvc2UgZWxlbWVudHMgYXJlIGluc3RhbmNlcyBvZiB0aGlzIGNsYXNzLlxuICAgKi9cbiAgc3RhdGljIGFzeW5jIHBhZ2UoY2xpZW50LCBpbnN0YW5jZVNldCwgcGFnZVBhcmFtcz17fSkge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLl9tYXBQYWdlKGNsaWVudCwgaW5zdGFuY2VTZXQsIHF1ZXJ5LmdldCwgcGFnZVBhcmFtcylcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyB7QGxpbmsgSW5kZXgjbWF0Y2h9IGFuZCB0aGVuIHdvcmtzIGp1c3QgbGlrZSB7QGxpbmsgcGFnZX0uXG4gICAqXG4gICAqIEBwYXJhbSB7SW5kZXh9IGluZGV4XG4gICAqIEBwYXJhbSBtYXRjaGVkVmFsdWVzIFZhbHVlcyBmb3Ige0BsaW5rIEluZGV4Lm1hdGNofS5cbiAgICogQHBhcmFtIHBhZ2VQYXJhbXMgUGFyYW1zIHRvIHtAbGluayBxdWVyeS5wYWdpbmF0ZX0uXG4gICAqIEByZXR1cm4ge1Byb21pc2U8UGFnZTx0aGlzPj59IFBhZ2Ugd2hvc2UgZWxlbWVudHMgYXJlIGluc3RhbmNlcyBvZiB0aGlzIGNsYXNzLlxuICAgKi9cbiAgc3RhdGljIGFzeW5jIHBhZ2VJbmRleChpbmRleCwgbWF0Y2hlZFZhbHVlcywgcGFnZVBhcmFtcz17fSkge1xuICAgIGlmICghKG1hdGNoZWRWYWx1ZXMgaW5zdGFuY2VvZiBBcnJheSkpXG4gICAgICBtYXRjaGVkVmFsdWVzID0gW21hdGNoZWRWYWx1ZXNdXG4gICAgY29uc3QgY2xpZW50ID0gaW5kZXguY2xpZW50XG4gICAgY29uc3QgbWF0Y2hTZXQgPSBpbmRleC5tYXRjaCguLi5tYXRjaGVkVmFsdWVzKVxuICAgIGNvbnN0IGdldHRlciA9IGluZGV4UmVmR2V0dGVyKGluZGV4KVxuICAgIHJldHVybiB0aGlzLl9tYXBQYWdlKGNsaWVudCwgbWF0Y2hTZXQsIGdldHRlciwgcGFnZVBhcmFtcylcbiAgfVxuXG4gIHN0YXRpYyBhc3luYyBfbWFwUGFnZShjbGllbnQsIGluc3RhbmNlU2V0LCBwYWdlTGFtYmRhLCBwYWdlUGFyYW1zKSB7XG4gICAgY29uc3QgcGFnZVF1ZXJ5ID0gcXVlcnkucGFnaW5hdGUoaW5zdGFuY2VTZXQsIHBhZ2VQYXJhbXMpXG4gICAgY29uc3QgbWFwUXVlcnkgPSBxdWVyeS5tYXAocGFnZUxhbWJkYSwgcGFnZVF1ZXJ5KVxuICAgIGNvbnN0IHBhZ2UgPSBQYWdlLmZyb21SYXcoYXdhaXQgY2xpZW50LnF1ZXJ5KG1hcFF1ZXJ5KSlcbiAgICByZXR1cm4gcGFnZS5tYXBEYXRhKHJlc291cmNlID0+IHRoaXMuZ2V0RnJvbVJlc291cmNlKGNsaWVudCwgcmVzb3VyY2UpKVxuICB9XG5cbiAgLyoqXG4gICAqIFN0cmVhbSBmb3IgYGluc3RhbmNlU2V0YCB0aGF0IGNvbnZlcnRzIHJlc3VsdHMgdG8gbW9kZWwgaW5zdGFuY2VzLlxuICAgKiBAcGFyYW0ge0NsaWVudH0gY2xpZW50XG4gICAqIEBwYXJhbSBpbnN0YW5jZVNldCBRdWVyeSBzZXQgb2Yge0BsaW5rIFJlZn1zIHRvIGluc3RhbmNlcyBvZiB0aGlzIGNsYXNzLlxuICAgKiBAcGFyYW0ge251bWJlcn0gb3B0cy5wYWdlU2l6ZSBTaXplIG9mIGVhY2ggcGFnZS5cbiAgICogQHJldHVybiB7UGFnZVN0cmVhbTx0aGlzPn0gU3RyZWFtIHdob3NlIGVsZW1lbnRzIGFyZSBpbnN0YW5jZXMgb2YgdGhpcyBjbGFzcy5cbiAgICovXG4gIHN0YXRpYyBzdHJlYW0oY2xpZW50LCBpbnN0YW5jZVNldCwgb3B0cz17fSkge1xuICAgIGNvbnN0IHtwYWdlU2l6ZX0gPSBhcHBseURlZmF1bHRzKG9wdHMsIHtcbiAgICAgIHBhZ2VTaXplOiB1bmRlZmluZWRcbiAgICB9KVxuICAgIHJldHVybiBQYWdlU3RyZWFtLmVsZW1lbnRzKGNsaWVudCwgaW5zdGFuY2VTZXQsIHtcbiAgICAgIHBhZ2VTaXplLFxuICAgICAgbWFwTGFtYmRhOiBxdWVyeS5nZXRcbiAgICB9KS5tYXAoaW5zdGFuY2UgPT4gdGhpcy5nZXRGcm9tUmVzb3VyY2UoY2xpZW50LCBpbnN0YW5jZSkpXG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMge0BsaW5rIEluZGV4I21hdGNofSBhbmQgdGhlbiB3b3JrcyBqdXN0IGxpa2Uge0BsaW5rIHBhZ2VTdHJlYW19LlxuICAgKlxuICAgKiBAcGFyYW0ge0luZGV4fSBpbmRleCBJbmRleCB3aG9zZSBpbnN0YW5jZXMgYXJlIGluc3RhbmNlcyBvZiB0aGlzIGNsYXNzLlxuICAgKiBAcGFyYW0gbWF0Y2hlZFZhbHVlcyBNYXRjaGVkIHZhbHVlIG9yIGFycmF5IG9mIG1hdGNoZWQgdmFsdWVzLCBwYXNzZWQgaW50byB7QGxpbmsgSW5kZXgubWF0Y2h9LlxuICAgKiBAcGFyYW0ge251bWJlcn0gb3B0cy5wYWdlU2l6ZSBTaXplIG9mIGVhY2ggcGFnZS5cbiAgICogQHJldHVybiB7UGFnZVN0cmVhbTx0aGlzPn0gU3RyZWFtIHdob3NlIGVsZW1lbnRzIGFyZSBpbnN0YW5jZXMgb2YgdGhpcyBjbGFzcy5cbiAgICovXG4gIHN0YXRpYyBzdHJlYW1JbmRleChpbmRleCwgbWF0Y2hlZFZhbHVlcywgb3B0cz17fSkge1xuICAgIGNvbnN0IHtwYWdlU2l6ZX0gPSBhcHBseURlZmF1bHRzKG9wdHMsIHtcbiAgICAgIHBhZ2VTaXplOiB1bmRlZmluZWRcbiAgICB9KVxuICAgIGNvbnN0IGNsaWVudCA9IGluZGV4LmNsaWVudFxuICAgIGlmICghKG1hdGNoZWRWYWx1ZXMgaW5zdGFuY2VvZiBBcnJheSkpXG4gICAgICBtYXRjaGVkVmFsdWVzID0gW21hdGNoZWRWYWx1ZXNdXG4gICAgY29uc3QgbWF0Y2hTZXQgPSBpbmRleC5tYXRjaCguLi5tYXRjaGVkVmFsdWVzKVxuICAgIHJldHVybiBQYWdlU3RyZWFtLmVsZW1lbnRzKGNsaWVudCwgbWF0Y2hTZXQsIHtcbiAgICAgIHBhZ2VTaXplLFxuICAgICAgbWFwTGFtYmRhOiBpbmRleFJlZkdldHRlcihpbmRleClcbiAgICB9KS5tYXAoaW5zdGFuY2UgPT4gdGhpcy5nZXRGcm9tUmVzb3VyY2UoY2xpZW50LCBpbnN0YW5jZSkpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZmlyc3QgaW5zdGFuY2UgbWF0Y2hlZCBieSB0aGUgaW5kZXguXG4gICAqIEBwYXJhbSB7SW5kZXh9IGluZGV4XG4gICAqIEBwYXJhbSBtYXRjaGVkVmFsdWVzIFNhbWUgYXMgZm9yIHtAbGluayBJbmRleC5tYXRjaH0uXG4gICAqIEByZXR1cm4ge1Byb21pc2U8dGhpcz59IEluc3RhbmNlIG9mIHRoaXMgY2xhc3MuXG4gICAqL1xuICBzdGF0aWMgYXN5bmMgZ2V0RnJvbUluZGV4KGluZGV4LCAuLi5tYXRjaGVkVmFsdWVzKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RnJvbVJlc291cmNlKGluZGV4LmNsaWVudCwgYXdhaXQgaW5kZXguZ2V0U2luZ2xlKC4uLm1hdGNoZWRWYWx1ZXMpKVxuICB9XG5cbiAgLyoqIEBpZ25vcmUgKi9cbiAgdG9TdHJpbmcoKSB7XG4gICAgY29uc3QgZmllbGRzID0gT2JqZWN0LmtleXModGhpcy5jb25zdHJ1Y3Rvci5maWVsZHMpLm1hcChrZXkgPT5cbiAgICAgIGAke2tleX06ICR7dGhpc1trZXldfWApLmpvaW4oJywgJylcbiAgICByZXR1cm4gYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSgke2ZpZWxkc30pYFxuICB9XG59XG5cbi8qKiBMYW1iZGEgZXhwcmVzc2lvbiBmb3IgZ2V0dGluZyBhbiBpbnN0YW5jZSBSZWYgb3V0IG9mIGEgbWF0Y2ggcmVzdWx0LiAqL1xuZnVuY3Rpb24gaW5kZXhSZWZHZXR0ZXIoaW5kZXgpIHtcbiAgcmV0dXJuIGluZGV4LnZhbHVlcyA/XG4gICAgYXJyID0+IHF1ZXJ5LmdldChxdWVyeS5zZWxlY3QoaW5kZXgudmFsdWVzLmxlbmd0aCwgYXJyKSkgOlxuICAgIHF1ZXJ5LmdldFxufVxuIl19