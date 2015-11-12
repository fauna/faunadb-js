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
 * Any {@link Ref}, {@link FaunaSet}, {@link FaunaTime}, or {@link FaunaDate}
 * values in it will also be parsed.
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
//# sourceMappingURL=data:application/json;base64,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QUFBO0FBQUEsQUFDdkMsU0FBSyxHQUFHO0FBQ04sWUFBTSx5QkFBaUIsZUFBZSxDQUFDLENBQUE7QUFBQSxBQUN6QyxTQUFLLEdBQUc7QUFDTixZQUFNLDZCQUFxQixlQUFlLENBQUMsQ0FBQTtBQUFBLEFBQzdDLFNBQUssR0FBRztBQUNOLFlBQU0scUJBQWEsZUFBZSxDQUFDLENBQUE7QUFBQSxBQUNyQyxTQUFLLEdBQUc7QUFDTixZQUFNLDZCQUFxQixlQUFlLENBQUMsQ0FBQTtBQUFBLEFBQzdDLFNBQUssR0FBRztBQUNOLFlBQU0sMEJBQWtCLGVBQWUsQ0FBQyxDQUFBO0FBQUEsQUFDMUMsU0FBSyxHQUFHO0FBQ04sWUFBTSw2QkFBcUIsZUFBZSxDQUFDLENBQUE7QUFBQSxBQUM3QztBQUNFLFlBQU0sMkJBQW1CLGVBQWUsQ0FBQyxDQUFBO0FBQUEsR0FDNUM7Q0FDSjs7QUFFRCxTQUFTLHFCQUFxQixDQUFDLEtBQUssRUFBRTtBQUNwQyxTQUFPLEtBQUssU0FBTyxhQUFZLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEdBQUc7V0FBTyxHQUFHLFNBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQztHQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUssRUFBRSxDQUFBO0NBQzFGIiwiZmlsZSI6IkNsaWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCByZXF1ZXN0IGZyb20gJ3JlcXVlc3QnXG5pbXBvcnQgd2luc3RvbiBmcm9tICd3aW5zdG9uJ1xuaW1wb3J0IHtCYWRSZXF1ZXN0LCBGYXVuYUhUVFBFcnJvciwgSW50ZXJuYWxFcnJvciwgTWV0aG9kTm90QWxsb3dlZCwgTm90Rm91bmQsXG4gIFBlcm1pc3Npb25EZW5pZWQsIFVuYXV0aG9yaXplZCwgVW5hdmFpbGFibGVFcnJvcn0gZnJvbSAnLi9lcnJvcnMnXG5pbXBvcnQge1JlZn0gZnJvbSAnLi9vYmplY3RzJ1xuaW1wb3J0IHt0b0pTT04sIHBhcnNlSlNPTn0gZnJvbSAnLi9fanNvbidcbmltcG9ydCB7YXBwbHlEZWZhdWx0cywgcmVtb3ZlVW5kZWZpbmVkVmFsdWVzfSBmcm9tICcuL191dGlsJ1xuY29uc3QgZW52ID0gcHJvY2Vzcy5lbnZcblxuY29uc3QgZGVidWdMb2dnZXIgPSBlbnYuRkFVTkFfREVCVUcgfHwgZW52Lk5PREVfREVCVUcgPT09ICdmYXVuYScgPyB3aW5zdG9uIDogbnVsbFxuXG4vKipcbiAqIERpcmVjdGx5IGNvbW11bmljYXRlcyB3aXRoIEZhdW5hREIgdmlhIEpTT04uXG4gKlxuICogSXQgaXMgZW5jb3VyYWdlZCB0byBwYXNzIGUuZy4ge0BsaW5rIFJlZn0gb2JqZWN0cyBpbnN0ZWFkIG9mIHJhdyBKU09OIGRhdGEuXG4gKlxuICogQWxsIG1ldGhvZHMgcmV0dXJuIGEgY29udmVydGVkIEpTT04gcmVzcG9uc2UuXG4gKiBUaGlzIGlzIGFuIG9iamVjdCBjb250YWluaW5nIEFycmF5cywgc3RyaW5ncywgYW5kIG90aGVyIG9iamVjdHMuXG4gKiBBbnkge0BsaW5rIFJlZn0sIHtAbGluayBGYXVuYVNldH0sIHtAbGluayBGYXVuYVRpbWV9LCBvciB7QGxpbmsgRmF1bmFEYXRlfVxuICogdmFsdWVzIGluIGl0IHdpbGwgYWxzbyBiZSBwYXJzZWQuXG4gKiAoU28gaW5zdGVhZCBvZiBgeyBcIkByZWZcIjogXCJjbGFzc2VzL2Zyb2dzLzEyM1wiIH1gLFxuICogeW91IHdpbGwgZ2V0IGBuZXcgUmVmKFwiY2xhc3Nlcy9mcm9ncy8xMjNcIilgLilcbiAqXG4gKiBUaGVyZSBpcyBubyB3YXkgdG8gYXV0b21hdGljYWxseSBjb252ZXJ0IHRvIGFueSBvdGhlciB0eXBlLCBzdWNoIGFzIHtAbGluayBFdmVudH0sXG4gKiBmcm9tIHRoZSByZXNwb25zZTsgeW91J2xsIGhhdmUgdG8gZG8gdGhhdCB5b3Vyc2VsZiBtYW51YWxseS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2xpZW50IHtcbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLmRvbWFpbiBCYXNlIFVSTCBmb3IgdGhlIEZhdW5hREIgc2VydmVyLlxuICAgKiBAcGFyYW0geygnaHR0cCd8J2h0dHBzJyl9IG9wdGlvbnMuc2NoZW1lIEhUVFAgc2NoZW1lIHRvIHVzZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IG9wdGlvbnMucG9ydCBQb3J0IG9mIHRoZSBGYXVuYURCIHNlcnZlci5cbiAgICogQHBhcmFtIHs/T2JqZWN0fSBvcHRpb25zLnNlY3JldFxuICAgKiAgIEF1dGggdG9rZW4gZm9yIHRoZSBGYXVuYURCIHNlcnZlci5cbiAgICogICBQYXNzZWQgc3RyYWlnaHQgdG8gW3JlcXVlc3RdKGh0dHBzOi8vZ2l0aHViLmNvbS9yZXF1ZXN0L3JlcXVlc3QjaHR0cC1hdXRoZW50aWNhdGlvbikuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnNlY3JldC51c2VyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnNlY3JldC5wYXNzXG4gICAqIEBwYXJhbSB7P251bWJlcn0gb3B0aW9ucy50aW1lb3V0IFJlYWQgdGltZW91dCBpbiBzZWNvbmRzLlxuICAgKiBAcGFyYW0gez9Mb2dnZXJ9IG9wdGlvbnMubG9nZ2VyXG4gICAqICAgQSBbd2luc3Rvbl0oaHR0cHM6Ly9naXRodWIuY29tL3dpbnN0b25qcy93aW5zdG9uKSBMb2dnZXJcbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBjb25zdCBvcHRzID0gYXBwbHlEZWZhdWx0cyhvcHRpb25zLCB7XG4gICAgICBkb21haW46ICdyZXN0LmZhdW5hZGIuY29tJyxcbiAgICAgIHNjaGVtZTogJ2h0dHBzJyxcbiAgICAgIHBvcnQ6IG51bGwsXG4gICAgICBzZWNyZXQ6IG51bGwsXG4gICAgICB0aW1lb3V0OiA2MCxcbiAgICAgIGxvZ2dlcjogbnVsbFxuICAgIH0pXG5cbiAgICBpZiAob3B0cy5wb3J0ID09PSBudWxsKVxuICAgICAgb3B0cy5wb3J0ID0gb3B0cy5zY2hlbWUgPT09ICdodHRwcycgPyA0NDMgOiA4MFxuXG4gICAgdGhpcy5fYmFzZVVybCA9IGAke29wdHMuc2NoZW1lfTovLyR7b3B0cy5kb21haW59OiR7b3B0cy5wb3J0fWBcbiAgICB0aGlzLl90aW1lb3V0ID0gTWF0aC5mbG9vcihvcHRzLnRpbWVvdXQgKiAxMDAwKVxuICAgIHRoaXMuX3NlY3JldCA9IG9wdHMuc2VjcmV0XG4gICAgdGhpcy5fbG9nZ2VyID0gb3B0cy5sb2dnZXJcbiAgfVxuXG4gIC8qKlxuICAgKiBIVFRQIGBHRVRgLlxuICAgKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcmVzdCkuXG4gICAqIEBwYXJhbSB7c3RyaW5nfFJlZn0gcGF0aCBQYXRoIHJlbGF0aXZlIHRoZSBgZG9tYWluYCBmcm9tIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICogQHBhcmFtIHtPYmplY3R9IHF1ZXJ5IFVSTCBwYXJhbWV0ZXJzLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlPE9iamVjdD59IENvbnZlcnRlZCBKU09OIHJlc3BvbnNlLlxuICAgKi9cbiAgZ2V0KHBhdGgsIHF1ZXJ5PW51bGwpIHtcbiAgICByZXR1cm4gdGhpcy5fZXhlY3V0ZSgnR0VUJywgcGF0aCwgbnVsbCwgcXVlcnkpXG4gIH1cblxuICAvKipcbiAgICogSFRUUCBgUE9TVGAuXG4gICAqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9yZXN0KS5cbiAgICogQHBhcmFtIHtzdHJpbmd8UmVmfSBwYXRoIFBhdGggcmVsYXRpdmUgdG8gdGhlIGBkb21haW5gIGZyb20gdGhlIGNvbnN0cnVjdG9yLlxuICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBPYmplY3QgdG8gYmUgY29udmVydGVkIHRvIHJlcXVlc3QgSlNPTi5cbiAgICogQHJldHVybiB7UHJvbWlzZTxPYmplY3Q+fSBDb252ZXJ0ZWQgSlNPTiByZXNwb25zZS5cbiAgICovXG4gIHBvc3QocGF0aCwgZGF0YSkge1xuICAgIHJldHVybiB0aGlzLl9leGVjdXRlKCdQT1NUJywgcGF0aCwgZGF0YSlcbiAgfVxuXG4gIC8qKlxuICAgKiBMaWtlIHtAbGluayBwb3N0fSwgYnV0IGEgYFBVVGAgcmVxdWVzdC5cbiAgICogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3Jlc3QpLlxuICAgKi9cbiAgcHV0KHBhdGgsIGRhdGEpIHtcbiAgICByZXR1cm4gdGhpcy5fZXhlY3V0ZSgnUFVUJywgcGF0aCwgZGF0YSlcbiAgfVxuXG4gIC8qKlxuICAgKiBMaWtlIHtAbGluayBwb3N0fSwgYnV0IGEgYFBBVENIYCByZXF1ZXN0LlxuICAgKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcmVzdCkuXG4gICAqL1xuICBwYXRjaChwYXRoLCBkYXRhKSB7XG4gICAgcmV0dXJuIHRoaXMuX2V4ZWN1dGUoJ1BBVENIJywgcGF0aCwgZGF0YSlcbiAgfVxuXG4gIC8qKlxuICAgKiBMaWtlIHtAbGluayBwb3N0fSwgYnV0IGEgYERFTEVURWAgcmVxdWVzdC5cbiAgICogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3Jlc3QpLlxuICAgKi9cbiAgZGVsZXRlKHBhdGgpIHtcbiAgICByZXR1cm4gdGhpcy5fZXhlY3V0ZSgnREVMRVRFJywgcGF0aClcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2UgdGhlIEZhdW5hREIgcXVlcnkgQVBJLlxuICAgKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcXVlcmllcylcbiAgICogYW5kIHRoZSBxdWVyeSBmdW5jdGlvbnMgaW4gdGhpcyBkb2N1bWVudGF0aW9uLlxuICAgKiBAcGFyYW0gZXhwcmVzc2lvbiB7b2JqZWN0fSBDcmVhdGVkIGZyb20gcXVlcnkgZnVuY3Rpb25zIHN1Y2ggYXMge0BsaW5rIGFkZH0uXG4gICAqIEByZXR1cm4ge1Byb21pc2U8T2JqZWN0Pn0gU2VydmVyJ3MgcmVzcG9uc2UgdG8gdGhlIHF1ZXJ5LlxuICAgKi9cbiAgcXVlcnkoZXhwcmVzc2lvbikge1xuICAgIHJldHVybiB0aGlzLl9leGVjdXRlKCdQT1NUJywgJycsIGV4cHJlc3Npb24pXG4gIH1cblxuICAvKipcbiAgICogUGluZyBGYXVuYURCLlxuICAgKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcmVzdCNvdGhlcikuXG4gICAqIEByZXR1cm4ge1Byb21pc2U8c3RyaW5nPn1cbiAgICovXG4gIHBpbmcoc2NvcGU9dW5kZWZpbmVkLCB0aW1lb3V0PXVuZGVmaW5lZCkge1xuICAgIHJldHVybiB0aGlzLmdldCgncGluZycsIHtzY29wZSwgdGltZW91dH0pXG4gIH1cblxuICBfbG9nKGluZGVudGVkLCBsb2dnZWQpIHtcbiAgICBpZiAoaW5kZW50ZWQpIHtcbiAgICAgIGNvbnN0IGluZGVudF9zdHIgPSAnICAnXG4gICAgICBsb2dnZWQgPSBpbmRlbnRfc3RyICsgbG9nZ2VkLnNwbGl0KCdcXG4nKS5qb2luKGBcXG4ke2luZGVudF9zdHJ9YClcbiAgICB9XG5cbiAgICBpZiAoZGVidWdMb2dnZXIgIT09IG51bGwpXG4gICAgICBkZWJ1Z0xvZ2dlci5pbmZvKGxvZ2dlZClcbiAgICBpZiAodGhpcy5fbG9nZ2VyICE9PSBudWxsKVxuICAgICAgdGhpcy5fbG9nZ2VyLmluZm8obG9nZ2VkKVxuICB9XG5cbiAgYXN5bmMgX2V4ZWN1dGUoYWN0aW9uLCBwYXRoLCBkYXRhLCBxdWVyeT1udWxsKSB7XG4gICAgaWYgKHBhdGggaW5zdGFuY2VvZiBSZWYpXG4gICAgICBwYXRoID0gcGF0aC52YWx1ZVxuICAgIGlmIChxdWVyeSAhPT0gbnVsbCkge1xuICAgICAgcXVlcnkgPSByZW1vdmVVbmRlZmluZWRWYWx1ZXMocXVlcnkpXG4gICAgICBpZiAoT2JqZWN0LmtleXMocXVlcnkpLmxlbmd0aCA9PT0gMClcbiAgICAgICAgcXVlcnkgPSBudWxsXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2xvZ2dlciA9PT0gbnVsbCAmJiBkZWJ1Z0xvZ2dlciA9PT0gbnVsbCkge1xuICAgICAgY29uc3Qge3Jlc3BvbnNlLCBib2R5fSA9IGF3YWl0IHRoaXMuX2V4ZWN1dGVfd2l0aG91dF9sb2dnaW5nKGFjdGlvbiwgcGF0aCwgZGF0YSwgcXVlcnkpXG4gICAgICByZXR1cm4gaGFuZGxlUmVzcG9uc2UocmVzcG9uc2UsIHBhcnNlSlNPTihib2R5KSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcmVhbF90aW1lX2JlZ2luID0gRGF0ZS5ub3coKVxuICAgICAgY29uc3Qge3Jlc3BvbnNlLCBib2R5fSA9IGF3YWl0IHRoaXMuX2V4ZWN1dGVfd2l0aG91dF9sb2dnaW5nKGFjdGlvbiwgcGF0aCwgZGF0YSwgcXVlcnkpXG4gICAgICBjb25zdCByZWFsX3RpbWUgPSBEYXRlLm5vdygpIC0gcmVhbF90aW1lX2JlZ2luXG5cbiAgICAgIHRoaXMuX2xvZyhmYWxzZSwgYEZhdW5hICR7YWN0aW9ufSAvJHtwYXRofSR7cXVlcnlTdHJpbmdGb3JMb2dnaW5nKHF1ZXJ5KX1gKVxuICAgICAgdGhpcy5fbG9nKHRydWUsIGBDcmVkZW50aWFsczogJHtKU09OLnN0cmluZ2lmeSh0aGlzLl9zZWNyZXQpfWApXG4gICAgICBpZiAoZGF0YSlcbiAgICAgICAgdGhpcy5fbG9nKHRydWUsIGBSZXF1ZXN0IEpTT046ICR7dG9KU09OKGRhdGEsIHRydWUpfWApXG5cbiAgICAgIGNvbnN0IGhlYWRlcnNfanNvbiA9IHRvSlNPTihyZXNwb25zZS5oZWFkZXJzLCB0cnVlKVxuICAgICAgY29uc3QgcmVzcG9uc2Vfb2JqZWN0ID0gcGFyc2VKU09OKGJvZHkpXG4gICAgICBjb25zdCByZXNwb25zZV9qc29uID0gdG9KU09OKHJlc3BvbnNlX29iamVjdCwgdHJ1ZSlcbiAgICAgIHRoaXMuX2xvZyh0cnVlLCBgUmVzcG9uc2UgaGVhZGVyczogJHtoZWFkZXJzX2pzb259YClcbiAgICAgIHRoaXMuX2xvZyh0cnVlLCBgUmVzcG9uc2UgSlNPTjogJHtyZXNwb25zZV9qc29ufWApXG4gICAgICBjb25zdFxuICAgICAgICBzdGF0dXNDb2RlID0gcmVzcG9uc2Uuc3RhdHVzQ29kZSxcbiAgICAgICAgYXBpVGltZSA9IHJlc3BvbnNlLmhlYWRlcnNbJ3gtaHR0cC1yZXF1ZXN0LXByb2Nlc3NpbmctdGltZSddLFxuICAgICAgICBsYXRlbmN5ID0gTWF0aC5mbG9vcihyZWFsX3RpbWUpXG4gICAgICB0aGlzLl9sb2codHJ1ZSxcbiAgICAgICAgYFJlc3BvbnNlICgke3N0YXR1c0NvZGV9KTogQVBJIHByb2Nlc3NpbmcgJHthcGlUaW1lfW1zLCBuZXR3b3JrIGxhdGVuY3kgJHtsYXRlbmN5fW1zYClcbiAgICAgIHJldHVybiBoYW5kbGVSZXNwb25zZShyZXNwb25zZSwgcmVzcG9uc2Vfb2JqZWN0KVxuICAgIH1cbiAgfVxuXG4gIF9leGVjdXRlX3dpdGhvdXRfbG9nZ2luZyhhY3Rpb24sIHBhdGgsIGRhdGEsIHF1ZXJ5KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIC8vIHJlcXVlc3QgaGFzIGEgYnVnIHdoZW4gdHJ5aW5nIHRvIHJlcXVlc3QgZW1wdHkgcGF0aC5cbiAgICAgIGlmIChwYXRoID09PSAnJylcbiAgICAgICAgcGF0aCA9ICcvJ1xuXG4gICAgICBjb25zdCBvcHRzID0ge1xuICAgICAgICBtZXRob2Q6IGFjdGlvbixcbiAgICAgICAgYmFzZVVybDogdGhpcy5fYmFzZVVybCxcbiAgICAgICAgdXJsOiBwYXRoLFxuICAgICAgICBhdXRoOiB0aGlzLl9zZWNyZXQsXG4gICAgICAgIHFzOiBxdWVyeSxcbiAgICAgICAgYm9keTogZGF0YSA9PT0gbnVsbCA/IG51bGwgOiB0b0pTT04oZGF0YSksXG4gICAgICAgIHRpbWVvdXQ6IHRoaXMuX3RpbWVvdXRcbiAgICAgIH1cblxuICAgICAgcmVxdWVzdChvcHRzLCAoZXJyLCByZXNwb25zZSwgYm9keSkgPT4ge1xuICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgIHJlamVjdChlcnIpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXNvbHZlKHtyZXNwb25zZSwgYm9keX0pXG4gICAgICB9KVxuICAgIH0pXG4gIH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UocmVzcG9uc2UsIHJlc3BvbnNlX29iamVjdCkge1xuICBjb25zdCBjb2RlID0gcmVzcG9uc2Uuc3RhdHVzQ29kZVxuICBpZiAoMjAwIDw9IGNvZGUgJiYgY29kZSA8PSAyOTkpXG4gICAgcmV0dXJuIHJlc3BvbnNlX29iamVjdC5yZXNvdXJjZVxuICBlbHNlXG4gICAgc3dpdGNoIChjb2RlKSB7XG4gICAgICBjYXNlIDQwMDpcbiAgICAgICAgdGhyb3cgbmV3IEJhZFJlcXVlc3QocmVzcG9uc2Vfb2JqZWN0KVxuICAgICAgY2FzZSA0MDE6XG4gICAgICAgIHRocm93IG5ldyBVbmF1dGhvcml6ZWQocmVzcG9uc2Vfb2JqZWN0KVxuICAgICAgY2FzZSA0MDM6XG4gICAgICAgIHRocm93IG5ldyBQZXJtaXNzaW9uRGVuaWVkKHJlc3BvbnNlX29iamVjdClcbiAgICAgIGNhc2UgNDA0OlxuICAgICAgICB0aHJvdyBuZXcgTm90Rm91bmQocmVzcG9uc2Vfb2JqZWN0KVxuICAgICAgY2FzZSA0MDU6XG4gICAgICAgIHRocm93IG5ldyBNZXRob2ROb3RBbGxvd2VkKHJlc3BvbnNlX29iamVjdClcbiAgICAgIGNhc2UgNTAwOlxuICAgICAgICB0aHJvdyBuZXcgSW50ZXJuYWxFcnJvcihyZXNwb25zZV9vYmplY3QpXG4gICAgICBjYXNlIDUwMzpcbiAgICAgICAgdGhyb3cgbmV3IFVuYXZhaWxhYmxlRXJyb3IocmVzcG9uc2Vfb2JqZWN0KVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEZhdW5hSFRUUEVycm9yKHJlc3BvbnNlX29iamVjdClcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHF1ZXJ5U3RyaW5nRm9yTG9nZ2luZyhxdWVyeSkge1xuICByZXR1cm4gcXVlcnkgPyBgPyR7T2JqZWN0LmtleXMocXVlcnkpLm1hcChrZXkgPT4gYCR7a2V5fT0ke3F1ZXJ5W2tleV19YCkuam9pbignJicpfWAgOiAnJ1xufVxuIl19