'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _errors = require('./errors');

var _objects = require('./objects');

var _json = require('./_json');

var _util = require('./_util');

var env = process.env;

var debugLogger = env.FAUNA_DEBUG || env.NODE_DEBUG === 'fauna' ? _winston2['default'] : null;

/**
 * Directly communicates with FaunaDB via JSON.
 *
 * It is encouraged to pass e.g. {@link Ref} objects instead of raw JSON data.
 *
 * All methods return a converted JSON response.
 * This is an object containing Arrays, strings, and other objects.
 * Any {@link Ref} or {@link Set} values in it will also be parsed.
 * (So instead of `{ "@ref": "classes/frogs/123" }`,
 * you will get `new Ref("classes/frogs/123")`.)
 *
 * There is no way to automatically convert to any other type, such as {@link Event},
 * from the response; you'll have to do that yourself manually.
 */

var Client = (function () {
  /**
   *
   * @param {string} options.domain Base URL for the FaunaDB server.
   * @param {('http'|'https')} options.scheme HTTP scheme to use.
   * @param {number} options.port Port of the FaunaDB server.
   * @param {?Object} options.secret
   *   Auth token for the FaunaDB server.
   *   Passed straight to [request](https://github.com/request/request#http-authentication).
   * @param {string} options.secret.user
   * @param {string} options.secret.pass
   * @param {?number} options.timeout Read timeout in seconds.
   * @param {?Logger} options.logger
   *   A [winston](https://github.com/winstonjs/winston) Logger
   */

  function Client(options) {
    _classCallCheck(this, Client);

    var opts = (0, _util.applyDefaults)(options, {
      domain: 'rest.faunadb.com',
      scheme: 'https',
      port: null,
      secret: null,
      timeout: 60,
      logger: null
    });

    if (opts.port === null) opts.port = opts.scheme === 'https' ? 443 : 80;

    this._baseUrl = opts.scheme + '://' + opts.domain + ':' + opts.port;
    this._timeout = Math.floor(opts.timeout * 1000);
    this._secret = opts.secret;
    this._logger = opts.logger;
  }

  /**
   * HTTP `GET`.
   * See the [docs](https://faunadb.com/documentation/rest).
   * @param {string|Ref} path Path relative the `domain` from the constructor.
   * @param {Object} query URL parameters.
   * @return {Promise<Object>} Converted JSON response.
   */

  _createClass(Client, [{
    key: 'get',
    value: function get(path) {
      var query = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      return this._execute('GET', path, null, query);
    }

    /**
     * HTTP `POST`.
     * See the [docs](https://faunadb.com/documentation/rest).
     * @param {string|Ref} path Path relative to the `domain` from the constructor.
     * @param {Object} data Object to be converted to request JSON.
     * @return {Promise<Object>} Converted JSON response.
     */
  }, {
    key: 'post',
    value: function post(path, data) {
      return this._execute('POST', path, data);
    }

    /**
     * Like {@link post}, but a `PUT` request.
     * See the [docs](https://faunadb.com/documentation/rest).
     */
  }, {
    key: 'put',
    value: function put(path, data) {
      return this._execute('PUT', path, data);
    }

    /**
     * Like {@link post}, but a `PATCH` request.
     * See the [docs](https://faunadb.com/documentation/rest).
     */
  }, {
    key: 'patch',
    value: function patch(path, data) {
      return this._execute('PATCH', path, data);
    }

    /**
     * Like {@link post}, but a `DELETE` request.
     * See the [docs](https://faunadb.com/documentation/rest).
     */
  }, {
    key: 'delete',
    value: function _delete(path) {
      return this._execute('DELETE', path);
    }

    /**
     * Use the FaunaDB query API.
     * See the [docs](https://faunadb.com/documentation/queries)
     * and the query functions in this documentation.
     * @param expression {object} Created from query functions such as {@link add}.
     * @return {Promise<Object>} Server's response to the query.
     */
  }, {
    key: 'query',
    value: function query(expression) {
      return this._execute('POST', '', expression);
    }

    /**
     * Ping FaunaDB.
     * See the [docs](https://faunadb.com/documentation/rest#other).
     * @return {Promise<string>}
     */
  }, {
    key: 'ping',
    value: function ping() {
      var scope = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];
      var timeout = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

      return this.get('ping', { scope: scope, timeout: timeout });
    }
  }, {
    key: '_log',
    value: function _log(indented, logged) {
      if (indented) {
        var indent_str = '  ';
        logged = indent_str + logged.split('\n').join('\n' + indent_str);
      }

      if (debugLogger !== null) debugLogger.info(logged);
      if (this._logger !== null) this._logger.info(logged);
    }
  }, {
    key: '_execute',
    value: function _execute(action, path, data) {
      var query = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

      var _ref, response, body, real_time_begin, _ref2, real_time, headers_json, response_object, response_json, statusCode, apiTime, latency;

      return _regeneratorRuntime.async(function _execute$(context$2$0) {
        while (1) switch (context$2$0.prev = context$2$0.next) {
          case 0:
            if (path instanceof _objects.Ref) path = path.value;
            if (query !== null) {
              query = (0, _util.removeUndefinedValues)(query);
              if (_Object$keys(query).length === 0) query = null;
            }

            if (!(this._logger === null && debugLogger === null)) {
              context$2$0.next = 11;
              break;
            }

            context$2$0.next = 5;
            return _regeneratorRuntime.awrap(this._execute_without_logging(action, path, data, query));

          case 5:
            _ref = context$2$0.sent;
            response = _ref.response;
            body = _ref.body;
            return context$2$0.abrupt('return', handleResponse(response, (0, _json.parseJSON)(body)));

          case 11:
            real_time_begin = Date.now();
            context$2$0.next = 14;
            return _regeneratorRuntime.awrap(this._execute_without_logging(action, path, data, query));

          case 14:
            _ref2 = context$2$0.sent;
            response = _ref2.response;
            body = _ref2.body;
            real_time = Date.now() - real_time_begin;

            this._log(false, 'Fauna ' + action + ' /' + path + queryStringForLogging(query));
            this._log(true, 'Credentials: ' + JSON.stringify(this._secret));
            if (data) this._log(true, 'Request JSON: ' + (0, _json.toJSON)(data, true));

            headers_json = (0, _json.toJSON)(response.headers, true);
            response_object = (0, _json.parseJSON)(body);
            response_json = (0, _json.toJSON)(response_object, true);

            this._log(true, 'Response headers: ' + headers_json);
            this._log(true, 'Response JSON: ' + response_json);
            statusCode = response.statusCode, apiTime = response.headers['x-http-request-processing-time'], latency = Math.floor(real_time);

            this._log(true, 'Response (' + statusCode + '): API processing ' + apiTime + 'ms, network latency ' + latency + 'ms');
            return context$2$0.abrupt('return', handleResponse(response, response_object));

          case 29:
          case 'end':
            return context$2$0.stop();
        }
      }, null, this);
    }
  }, {
    key: '_execute_without_logging',
    value: function _execute_without_logging(action, path, data, query) {
      var _this = this;

      return new _Promise(function (resolve, reject) {
        // request has a bug when trying to request empty path.
        if (path === '') path = '/';

        var opts = {
          method: action,
          baseUrl: _this._baseUrl,
          url: path,
          auth: _this._secret,
          qs: query,
          body: data === null ? null : (0, _json.toJSON)(data),
          timeout: _this._timeout
        };

        (0, _request2['default'])(opts, function (err, response, body) {
          if (err) reject(err);else resolve({ response: response, body: body });
        });
      });
    }
  }]);

  return Client;
})();

exports['default'] = Client;

function handleResponse(response, response_object) {
  var code = response.statusCode;
  if (200 <= code && code <= 299) return response_object.resource;else switch (code) {
    case 400:
      throw new _errors.BadRequest(response_object);
    case 401:
      throw new _errors.Unauthorized(response_object);
    case 403:
      throw new _errors.PermissionDenied(response_object);
    case 404:
      throw new _errors.NotFound(response_object);
    case 405:
      throw new _errors.MethodNotAllowed(response_object);
    case 500:
      throw new _errors.InternalError(response_object);
    case 503:
      throw new _errors.UnavailableError(response_object);
    default:
      throw new _errors.FaunaHTTPError(response_object);
  }
}

function queryStringForLogging(query) {
  return query ? '?' + _Object$keys(query).map(function (key) {
    return key + '=' + query[key];
  }).join('&') : '';
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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QUE7QUFBQSxBQUN2QyxTQUFLLEdBQUc7QUFDTixZQUFNLHlCQUFpQixlQUFlLENBQUMsQ0FBQTtBQUFBLEFBQ3pDLFNBQUssR0FBRztBQUNOLFlBQU0sNkJBQXFCLGVBQWUsQ0FBQyxDQUFBO0FBQUEsQUFDN0MsU0FBSyxHQUFHO0FBQ04sWUFBTSxxQkFBYSxlQUFlLENBQUMsQ0FBQTtBQUFBLEFBQ3JDLFNBQUssR0FBRztBQUNOLFlBQU0sNkJBQXFCLGVBQWUsQ0FBQyxDQUFBO0FBQUEsQUFDN0MsU0FBSyxHQUFHO0FBQ04sWUFBTSwwQkFBa0IsZUFBZSxDQUFDLENBQUE7QUFBQSxBQUMxQyxTQUFLLEdBQUc7QUFDTixZQUFNLDZCQUFxQixlQUFlLENBQUMsQ0FBQTtBQUFBLEFBQzdDO0FBQ0UsWUFBTSwyQkFBbUIsZUFBZSxDQUFDLENBQUE7QUFBQSxHQUM1QztDQUNKOztBQUVELFNBQVMscUJBQXFCLENBQUMsS0FBSyxFQUFFO0FBQ3BDLFNBQU8sS0FBSyxTQUFPLGFBQVksS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsR0FBRztXQUFPLEdBQUcsU0FBSSxLQUFLLENBQUMsR0FBRyxDQUFDO0dBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBSyxFQUFFLENBQUE7Q0FDMUYiLCJmaWxlIjoiQ2xpZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHJlcXVlc3QgZnJvbSAncmVxdWVzdCdcbmltcG9ydCB3aW5zdG9uIGZyb20gJ3dpbnN0b24nXG5pbXBvcnQge0JhZFJlcXVlc3QsIEZhdW5hSFRUUEVycm9yLCBJbnRlcm5hbEVycm9yLCBNZXRob2ROb3RBbGxvd2VkLCBOb3RGb3VuZCxcbiAgUGVybWlzc2lvbkRlbmllZCwgVW5hdXRob3JpemVkLCBVbmF2YWlsYWJsZUVycm9yfSBmcm9tICcuL2Vycm9ycydcbmltcG9ydCB7UmVmfSBmcm9tICcuL29iamVjdHMnXG5pbXBvcnQge3RvSlNPTiwgcGFyc2VKU09OfSBmcm9tICcuL19qc29uJ1xuaW1wb3J0IHthcHBseURlZmF1bHRzLCByZW1vdmVVbmRlZmluZWRWYWx1ZXN9IGZyb20gJy4vX3V0aWwnXG5jb25zdCBlbnYgPSBwcm9jZXNzLmVudlxuXG5jb25zdCBkZWJ1Z0xvZ2dlciA9IGVudi5GQVVOQV9ERUJVRyB8fCBlbnYuTk9ERV9ERUJVRyA9PT0gJ2ZhdW5hJyA/IHdpbnN0b24gOiBudWxsXG5cbi8qKlxuICogRGlyZWN0bHkgY29tbXVuaWNhdGVzIHdpdGggRmF1bmFEQiB2aWEgSlNPTi5cbiAqXG4gKiBJdCBpcyBlbmNvdXJhZ2VkIHRvIHBhc3MgZS5nLiB7QGxpbmsgUmVmfSBvYmplY3RzIGluc3RlYWQgb2YgcmF3IEpTT04gZGF0YS5cbiAqXG4gKiBBbGwgbWV0aG9kcyByZXR1cm4gYSBjb252ZXJ0ZWQgSlNPTiByZXNwb25zZS5cbiAqIFRoaXMgaXMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgQXJyYXlzLCBzdHJpbmdzLCBhbmQgb3RoZXIgb2JqZWN0cy5cbiAqIEFueSB7QGxpbmsgUmVmfSBvciB7QGxpbmsgU2V0fSB2YWx1ZXMgaW4gaXQgd2lsbCBhbHNvIGJlIHBhcnNlZC5cbiAqIChTbyBpbnN0ZWFkIG9mIGB7IFwiQHJlZlwiOiBcImNsYXNzZXMvZnJvZ3MvMTIzXCIgfWAsXG4gKiB5b3Ugd2lsbCBnZXQgYG5ldyBSZWYoXCJjbGFzc2VzL2Zyb2dzLzEyM1wiKWAuKVxuICpcbiAqIFRoZXJlIGlzIG5vIHdheSB0byBhdXRvbWF0aWNhbGx5IGNvbnZlcnQgdG8gYW55IG90aGVyIHR5cGUsIHN1Y2ggYXMge0BsaW5rIEV2ZW50fSxcbiAqIGZyb20gdGhlIHJlc3BvbnNlOyB5b3UnbGwgaGF2ZSB0byBkbyB0aGF0IHlvdXJzZWxmIG1hbnVhbGx5LlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDbGllbnQge1xuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuZG9tYWluIEJhc2UgVVJMIGZvciB0aGUgRmF1bmFEQiBzZXJ2ZXIuXG4gICAqIEBwYXJhbSB7KCdodHRwJ3wnaHR0cHMnKX0gb3B0aW9ucy5zY2hlbWUgSFRUUCBzY2hlbWUgdG8gdXNlLlxuICAgKiBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5wb3J0IFBvcnQgb2YgdGhlIEZhdW5hREIgc2VydmVyLlxuICAgKiBAcGFyYW0gez9PYmplY3R9IG9wdGlvbnMuc2VjcmV0XG4gICAqICAgQXV0aCB0b2tlbiBmb3IgdGhlIEZhdW5hREIgc2VydmVyLlxuICAgKiAgIFBhc3NlZCBzdHJhaWdodCB0byBbcmVxdWVzdF0oaHR0cHM6Ly9naXRodWIuY29tL3JlcXVlc3QvcmVxdWVzdCNodHRwLWF1dGhlbnRpY2F0aW9uKS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuc2VjcmV0LnVzZXJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuc2VjcmV0LnBhc3NcbiAgICogQHBhcmFtIHs/bnVtYmVyfSBvcHRpb25zLnRpbWVvdXQgUmVhZCB0aW1lb3V0IGluIHNlY29uZHMuXG4gICAqIEBwYXJhbSB7P0xvZ2dlcn0gb3B0aW9ucy5sb2dnZXJcbiAgICogICBBIFt3aW5zdG9uXShodHRwczovL2dpdGh1Yi5jb20vd2luc3RvbmpzL3dpbnN0b24pIExvZ2dlclxuICAgKi9cbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIGNvbnN0IG9wdHMgPSBhcHBseURlZmF1bHRzKG9wdGlvbnMsIHtcbiAgICAgIGRvbWFpbjogJ3Jlc3QuZmF1bmFkYi5jb20nLFxuICAgICAgc2NoZW1lOiAnaHR0cHMnLFxuICAgICAgcG9ydDogbnVsbCxcbiAgICAgIHNlY3JldDogbnVsbCxcbiAgICAgIHRpbWVvdXQ6IDYwLFxuICAgICAgbG9nZ2VyOiBudWxsXG4gICAgfSlcblxuICAgIGlmIChvcHRzLnBvcnQgPT09IG51bGwpXG4gICAgICBvcHRzLnBvcnQgPSBvcHRzLnNjaGVtZSA9PT0gJ2h0dHBzJyA/IDQ0MyA6IDgwXG5cbiAgICB0aGlzLl9iYXNlVXJsID0gYCR7b3B0cy5zY2hlbWV9Oi8vJHtvcHRzLmRvbWFpbn06JHtvcHRzLnBvcnR9YFxuICAgIHRoaXMuX3RpbWVvdXQgPSBNYXRoLmZsb29yKG9wdHMudGltZW91dCAqIDEwMDApXG4gICAgdGhpcy5fc2VjcmV0ID0gb3B0cy5zZWNyZXRcbiAgICB0aGlzLl9sb2dnZXIgPSBvcHRzLmxvZ2dlclxuICB9XG5cbiAgLyoqXG4gICAqIEhUVFAgYEdFVGAuXG4gICAqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9yZXN0KS5cbiAgICogQHBhcmFtIHtzdHJpbmd8UmVmfSBwYXRoIFBhdGggcmVsYXRpdmUgdGhlIGBkb21haW5gIGZyb20gdGhlIGNvbnN0cnVjdG9yLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcXVlcnkgVVJMIHBhcmFtZXRlcnMuXG4gICAqIEByZXR1cm4ge1Byb21pc2U8T2JqZWN0Pn0gQ29udmVydGVkIEpTT04gcmVzcG9uc2UuXG4gICAqL1xuICBnZXQocGF0aCwgcXVlcnk9bnVsbCkge1xuICAgIHJldHVybiB0aGlzLl9leGVjdXRlKCdHRVQnLCBwYXRoLCBudWxsLCBxdWVyeSlcbiAgfVxuXG4gIC8qKlxuICAgKiBIVFRQIGBQT1NUYC5cbiAgICogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3Jlc3QpLlxuICAgKiBAcGFyYW0ge3N0cmluZ3xSZWZ9IHBhdGggUGF0aCByZWxhdGl2ZSB0byB0aGUgYGRvbWFpbmAgZnJvbSB0aGUgY29uc3RydWN0b3IuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhIE9iamVjdCB0byBiZSBjb252ZXJ0ZWQgdG8gcmVxdWVzdCBKU09OLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlPE9iamVjdD59IENvbnZlcnRlZCBKU09OIHJlc3BvbnNlLlxuICAgKi9cbiAgcG9zdChwYXRoLCBkYXRhKSB7XG4gICAgcmV0dXJuIHRoaXMuX2V4ZWN1dGUoJ1BPU1QnLCBwYXRoLCBkYXRhKVxuICB9XG5cbiAgLyoqXG4gICAqIExpa2Uge0BsaW5rIHBvc3R9LCBidXQgYSBgUFVUYCByZXF1ZXN0LlxuICAgKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcmVzdCkuXG4gICAqL1xuICBwdXQocGF0aCwgZGF0YSkge1xuICAgIHJldHVybiB0aGlzLl9leGVjdXRlKCdQVVQnLCBwYXRoLCBkYXRhKVxuICB9XG5cbiAgLyoqXG4gICAqIExpa2Uge0BsaW5rIHBvc3R9LCBidXQgYSBgUEFUQ0hgIHJlcXVlc3QuXG4gICAqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9yZXN0KS5cbiAgICovXG4gIHBhdGNoKHBhdGgsIGRhdGEpIHtcbiAgICByZXR1cm4gdGhpcy5fZXhlY3V0ZSgnUEFUQ0gnLCBwYXRoLCBkYXRhKVxuICB9XG5cbiAgLyoqXG4gICAqIExpa2Uge0BsaW5rIHBvc3R9LCBidXQgYSBgREVMRVRFYCByZXF1ZXN0LlxuICAgKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcmVzdCkuXG4gICAqL1xuICBkZWxldGUocGF0aCkge1xuICAgIHJldHVybiB0aGlzLl9leGVjdXRlKCdERUxFVEUnLCBwYXRoKVxuICB9XG5cbiAgLyoqXG4gICAqIFVzZSB0aGUgRmF1bmFEQiBxdWVyeSBBUEkuXG4gICAqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzKVxuICAgKiBhbmQgdGhlIHF1ZXJ5IGZ1bmN0aW9ucyBpbiB0aGlzIGRvY3VtZW50YXRpb24uXG4gICAqIEBwYXJhbSBleHByZXNzaW9uIHtvYmplY3R9IENyZWF0ZWQgZnJvbSBxdWVyeSBmdW5jdGlvbnMgc3VjaCBhcyB7QGxpbmsgYWRkfS5cbiAgICogQHJldHVybiB7UHJvbWlzZTxPYmplY3Q+fSBTZXJ2ZXIncyByZXNwb25zZSB0byB0aGUgcXVlcnkuXG4gICAqL1xuICBxdWVyeShleHByZXNzaW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuX2V4ZWN1dGUoJ1BPU1QnLCAnJywgZXhwcmVzc2lvbilcbiAgfVxuXG4gIC8qKlxuICAgKiBQaW5nIEZhdW5hREIuXG4gICAqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9yZXN0I290aGVyKS5cbiAgICogQHJldHVybiB7UHJvbWlzZTxzdHJpbmc+fVxuICAgKi9cbiAgcGluZyhzY29wZT11bmRlZmluZWQsIHRpbWVvdXQ9dW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdwaW5nJywge3Njb3BlLCB0aW1lb3V0fSlcbiAgfVxuXG4gIF9sb2coaW5kZW50ZWQsIGxvZ2dlZCkge1xuICAgIGlmIChpbmRlbnRlZCkge1xuICAgICAgY29uc3QgaW5kZW50X3N0ciA9ICcgICdcbiAgICAgIGxvZ2dlZCA9IGluZGVudF9zdHIgKyBsb2dnZWQuc3BsaXQoJ1xcbicpLmpvaW4oYFxcbiR7aW5kZW50X3N0cn1gKVxuICAgIH1cblxuICAgIGlmIChkZWJ1Z0xvZ2dlciAhPT0gbnVsbClcbiAgICAgIGRlYnVnTG9nZ2VyLmluZm8obG9nZ2VkKVxuICAgIGlmICh0aGlzLl9sb2dnZXIgIT09IG51bGwpXG4gICAgICB0aGlzLl9sb2dnZXIuaW5mbyhsb2dnZWQpXG4gIH1cblxuICBhc3luYyBfZXhlY3V0ZShhY3Rpb24sIHBhdGgsIGRhdGEsIHF1ZXJ5PW51bGwpIHtcbiAgICBpZiAocGF0aCBpbnN0YW5jZW9mIFJlZilcbiAgICAgIHBhdGggPSBwYXRoLnZhbHVlXG4gICAgaWYgKHF1ZXJ5ICE9PSBudWxsKSB7XG4gICAgICBxdWVyeSA9IHJlbW92ZVVuZGVmaW5lZFZhbHVlcyhxdWVyeSlcbiAgICAgIGlmIChPYmplY3Qua2V5cyhxdWVyeSkubGVuZ3RoID09PSAwKVxuICAgICAgICBxdWVyeSA9IG51bGxcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbG9nZ2VyID09PSBudWxsICYmIGRlYnVnTG9nZ2VyID09PSBudWxsKSB7XG4gICAgICBjb25zdCB7cmVzcG9uc2UsIGJvZHl9ID0gYXdhaXQgdGhpcy5fZXhlY3V0ZV93aXRob3V0X2xvZ2dpbmcoYWN0aW9uLCBwYXRoLCBkYXRhLCBxdWVyeSlcbiAgICAgIHJldHVybiBoYW5kbGVSZXNwb25zZShyZXNwb25zZSwgcGFyc2VKU09OKGJvZHkpKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCByZWFsX3RpbWVfYmVnaW4gPSBEYXRlLm5vdygpXG4gICAgICBjb25zdCB7cmVzcG9uc2UsIGJvZHl9ID0gYXdhaXQgdGhpcy5fZXhlY3V0ZV93aXRob3V0X2xvZ2dpbmcoYWN0aW9uLCBwYXRoLCBkYXRhLCBxdWVyeSlcbiAgICAgIGNvbnN0IHJlYWxfdGltZSA9IERhdGUubm93KCkgLSByZWFsX3RpbWVfYmVnaW5cblxuICAgICAgdGhpcy5fbG9nKGZhbHNlLCBgRmF1bmEgJHthY3Rpb259IC8ke3BhdGh9JHtxdWVyeVN0cmluZ0ZvckxvZ2dpbmcocXVlcnkpfWApXG4gICAgICB0aGlzLl9sb2codHJ1ZSwgYENyZWRlbnRpYWxzOiAke0pTT04uc3RyaW5naWZ5KHRoaXMuX3NlY3JldCl9YClcbiAgICAgIGlmIChkYXRhKVxuICAgICAgICB0aGlzLl9sb2codHJ1ZSwgYFJlcXVlc3QgSlNPTjogJHt0b0pTT04oZGF0YSwgdHJ1ZSl9YClcblxuICAgICAgY29uc3QgaGVhZGVyc19qc29uID0gdG9KU09OKHJlc3BvbnNlLmhlYWRlcnMsIHRydWUpXG4gICAgICBjb25zdCByZXNwb25zZV9vYmplY3QgPSBwYXJzZUpTT04oYm9keSlcbiAgICAgIGNvbnN0IHJlc3BvbnNlX2pzb24gPSB0b0pTT04ocmVzcG9uc2Vfb2JqZWN0LCB0cnVlKVxuICAgICAgdGhpcy5fbG9nKHRydWUsIGBSZXNwb25zZSBoZWFkZXJzOiAke2hlYWRlcnNfanNvbn1gKVxuICAgICAgdGhpcy5fbG9nKHRydWUsIGBSZXNwb25zZSBKU09OOiAke3Jlc3BvbnNlX2pzb259YClcbiAgICAgIGNvbnN0XG4gICAgICAgIHN0YXR1c0NvZGUgPSByZXNwb25zZS5zdGF0dXNDb2RlLFxuICAgICAgICBhcGlUaW1lID0gcmVzcG9uc2UuaGVhZGVyc1sneC1odHRwLXJlcXVlc3QtcHJvY2Vzc2luZy10aW1lJ10sXG4gICAgICAgIGxhdGVuY3kgPSBNYXRoLmZsb29yKHJlYWxfdGltZSlcbiAgICAgIHRoaXMuX2xvZyh0cnVlLFxuICAgICAgICBgUmVzcG9uc2UgKCR7c3RhdHVzQ29kZX0pOiBBUEkgcHJvY2Vzc2luZyAke2FwaVRpbWV9bXMsIG5ldHdvcmsgbGF0ZW5jeSAke2xhdGVuY3l9bXNgKVxuICAgICAgcmV0dXJuIGhhbmRsZVJlc3BvbnNlKHJlc3BvbnNlLCByZXNwb25zZV9vYmplY3QpXG4gICAgfVxuICB9XG5cbiAgX2V4ZWN1dGVfd2l0aG91dF9sb2dnaW5nKGFjdGlvbiwgcGF0aCwgZGF0YSwgcXVlcnkpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgLy8gcmVxdWVzdCBoYXMgYSBidWcgd2hlbiB0cnlpbmcgdG8gcmVxdWVzdCBlbXB0eSBwYXRoLlxuICAgICAgaWYgKHBhdGggPT09ICcnKVxuICAgICAgICBwYXRoID0gJy8nXG5cbiAgICAgIGNvbnN0IG9wdHMgPSB7XG4gICAgICAgIG1ldGhvZDogYWN0aW9uLFxuICAgICAgICBiYXNlVXJsOiB0aGlzLl9iYXNlVXJsLFxuICAgICAgICB1cmw6IHBhdGgsXG4gICAgICAgIGF1dGg6IHRoaXMuX3NlY3JldCxcbiAgICAgICAgcXM6IHF1ZXJ5LFxuICAgICAgICBib2R5OiBkYXRhID09PSBudWxsID8gbnVsbCA6IHRvSlNPTihkYXRhKSxcbiAgICAgICAgdGltZW91dDogdGhpcy5fdGltZW91dFxuICAgICAgfVxuXG4gICAgICByZXF1ZXN0KG9wdHMsIChlcnIsIHJlc3BvbnNlLCBib2R5KSA9PiB7XG4gICAgICAgIGlmIChlcnIpXG4gICAgICAgICAgcmVqZWN0KGVycilcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJlc29sdmUoe3Jlc3BvbnNlLCBib2R5fSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxufVxuXG5mdW5jdGlvbiBoYW5kbGVSZXNwb25zZShyZXNwb25zZSwgcmVzcG9uc2Vfb2JqZWN0KSB7XG4gIGNvbnN0IGNvZGUgPSByZXNwb25zZS5zdGF0dXNDb2RlXG4gIGlmICgyMDAgPD0gY29kZSAmJiBjb2RlIDw9IDI5OSlcbiAgICByZXR1cm4gcmVzcG9uc2Vfb2JqZWN0LnJlc291cmNlXG4gIGVsc2VcbiAgICBzd2l0Y2ggKGNvZGUpIHtcbiAgICAgIGNhc2UgNDAwOlxuICAgICAgICB0aHJvdyBuZXcgQmFkUmVxdWVzdChyZXNwb25zZV9vYmplY3QpXG4gICAgICBjYXNlIDQwMTpcbiAgICAgICAgdGhyb3cgbmV3IFVuYXV0aG9yaXplZChyZXNwb25zZV9vYmplY3QpXG4gICAgICBjYXNlIDQwMzpcbiAgICAgICAgdGhyb3cgbmV3IFBlcm1pc3Npb25EZW5pZWQocmVzcG9uc2Vfb2JqZWN0KVxuICAgICAgY2FzZSA0MDQ6XG4gICAgICAgIHRocm93IG5ldyBOb3RGb3VuZChyZXNwb25zZV9vYmplY3QpXG4gICAgICBjYXNlIDQwNTpcbiAgICAgICAgdGhyb3cgbmV3IE1ldGhvZE5vdEFsbG93ZWQocmVzcG9uc2Vfb2JqZWN0KVxuICAgICAgY2FzZSA1MDA6XG4gICAgICAgIHRocm93IG5ldyBJbnRlcm5hbEVycm9yKHJlc3BvbnNlX29iamVjdClcbiAgICAgIGNhc2UgNTAzOlxuICAgICAgICB0aHJvdyBuZXcgVW5hdmFpbGFibGVFcnJvcihyZXNwb25zZV9vYmplY3QpXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRmF1bmFIVFRQRXJyb3IocmVzcG9uc2Vfb2JqZWN0KVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcXVlcnlTdHJpbmdGb3JMb2dnaW5nKHF1ZXJ5KSB7XG4gIHJldHVybiBxdWVyeSA/IGA/JHtPYmplY3Qua2V5cyhxdWVyeSkubWFwKGtleSA9PiBgJHtrZXl9PSR7cXVlcnlba2V5XX1gKS5qb2luKCcmJyl9YCA6ICcnXG59XG4iXX0=