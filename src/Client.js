'use strict';

var btoa = require('btoa-lite');
var request = require('superagent');
var errors = require('./errors');
var query = require('./query');
var values = require('./values');
var json = require('./_json');
var RequestResult = require('./RequestResult');
var util = require('./_util');
var PageHelper = require('./PageHelper');
var Promise = require('es6-promise').Promise;

/**
 * The callback that will be executed after every completed request.
 *
 * @callback Client~observerCallback
 * @param {RequestResult} res
 */

/**
 * A client for interacting with FaunaDB.
 *
 * Users will mainly call the {@link Client#query} method to execute queries.
 *
 * See the [FaunaDB Documentation](https://fauna.com/documentation) for detailed examples.
 *
 * All methods return promises containing a JSON object that represents the FaunaDB response.
 * Literal types in the response object will remain as strings, Arrays, and objects.
 * FaunaDB types, such as {@link Ref}, {@link SetRef}, {@link FaunaTime}, and {@link FaunaDate} will
 * be converted into the appropriate object.
 *
 * (So if a response contains `{ "@ref": "classes/frogs/123" }`,
 * it will be returned as `new Ref("classes/frogs/123")`.)
 *
 * @constructor
 * @param {?Object} options
 *   Object that configures this FaunaDB client.
 * @param {?string} options.domain
 *   Base URL for the FaunaDB server.
 * @param {?('http'|'https')} options.scheme
 *   HTTP scheme to use.
 * @param {?number} options.port
 *   Port of the FaunaDB server.
 * @param {?string} options.secret FaunaDB secret (see [Reference Documentation](https://fauna.com/documentation/objects#keys))
 * @param {?number} options.timeout Read timeout in seconds.
 * @param {?Client~observerCallback} options.observer
 *   Callback that will be called after every completed request.
 */
function Client(options) {
  var opts = util.applyDefaults(options, {
    domain: 'db.fauna.com',
    scheme: 'https',
    port: null,
    secret: null,
    timeout: 60,
    observer: null
  });

  if (opts.port === null) {
    opts.port = opts.scheme === 'https' ? 443 : 80;
  }

  this._baseUrl = opts.scheme + '://' + opts.domain + ':' + opts.port;
  this._timeout = Math.floor(opts.timeout * 1000);
  this._secret = opts.secret;
  this._observer = opts.observer;
}

/**
 * Executes a query via the FaunaDB Query API.
 * See the [docs](https://fauna.com/documentation/queries),
 * and the query functions in this documentation.
 * @param expression {Expr}
 *   The query to execute. Created from query functions such as {@link add}.
 * @return {external:Promise<Object>} FaunaDB response object.
 */
Client.prototype.query = function (expression) {
  return this._execute('POST', '', query.wrap(expression));
};

/**
 * Returns a {@link PageHelper} for the given Query expression.
 * This provides a helpful API for paginating over FaunaDB responses.
 * @param expression {Expr}
 *   The Query expression to paginate over.
 * @param params {Object}
 *   Options to be passed to the paginate function. See [paginate](https://fauna.com/documentation/queries#read_functions).
 * @returns {PageHelper} A PageHelper that wraps the provided expression.
 */
Client.prototype.paginate = function(expression, params) {
  params = defaults(params, {});

  return new PageHelper(this, expression, params);
};

/**
 * Issues a HTTP `GET` request via the legacy REST API.
 * See the [docs](https://fauna.com/documentation/rest).
 * @deprecated Use the {@link Client#query} API where possible.
 * @param {(string|Ref)} path Path relative the `domain` from the constructor.
 * @param {Object} query URL parameters.
 * @return {external:Promise<Object>} FaunaDB response object.
 */
Client.prototype.get = function (path, query) {
  query = defaults(query, null);
  return this._execute('GET', path, null, query);
};

/**
 * Issues a HTTP `POST` request via the legacy REST API.
 * See the [docs](https://fauna.com/documentation/rest).
 * @deprecated Use the {@link Client#query} API where possible.
 * @param {(string|Ref)} path Path relative to the `domain` from the constructor.
 * @param {Object} data Object to be converted to request JSON.
 * @return {external:Promise<Object>} FaunaDB response object.
 */
Client.prototype.post = function (path, data) {
  return this._execute('POST', path, data);
};

/**
 * Issues a HTTP `PUT` request via the legacy REST API.
 * See the [docs](https://fauna.com/documentation/rest).
 * @deprecated Use the {@link Client#query} API where possible.
 * @param {(string|Ref)} path Path relative to the `domain` from the constructor.
 * @param {Object} data Object to be converted to the request JSON.
 * @return {external:Promise<Object>} FaunaDB response object.
 */
Client.prototype.put = function (path, data) {
  return this._execute('PUT', path, data);
};

/**
 * Issues a HTTP `PATCH` request via the legacy REST API.
 * See the [docs](https://fauna.com/documentation/rest).
 * @deprecated Use the {@link Client#query} API where possible.
 * @param {(string|Ref)} path Path relative to the `domain` from the constructor.
 * @param {Object} data Object to be converted to the request JSON.
 * @return {external:Promise<Object>} FaunaDB response object.
 */
Client.prototype.patch = function (path, data) {
  return this._execute('PATCH', path, data);
};

/**
 * Issues a HTTP `DELETE` request via the legacy REST API.
 * See the [docs](https://fauna.com/documentation/rest).
 * @deprecated Use the {@link Client#query} API where possible.
 * @param {(string|Ref)} path Path relative to the `domain` from the constructor.
 * @return {external:Promise<Object>} FaunaDB response object.
 */
Client.prototype.delete = function (path) {
  return this._execute('DELETE', path);
};

/**
 * Sends a `ping` request to FaunaDB.
 * See the [docs](https://fauna.com/documentation/rest#other).
 * @return {external:Promise<string>} Ping response.
 */
Client.prototype.ping = function (scope, timeout) {
  return this.get('ping', { scope: scope, timeout: timeout });
};

Client.prototype._execute = function (action, path, data, query) {
  query = defaults(query, null);

  if (path instanceof values.Ref) {
    path = path.value;
  }

  if (query !== null) {
    query = util.removeUndefinedValues(query);
  }

  var startTime = Date.now();
  var self = this;
  return this._performRequest(action, path, data, query).then(function (response) {
    var endTime = Date.now();
    var responseObject = json.parseJSON(response.text);
    var requestResult = new RequestResult(
      self,
      action, path, query, data,
      response.text, responseObject, response.status, response.header,
      startTime, endTime);

    if (self._observer != null) {
      self._observer(requestResult);
    }

    errors.FaunaHTTPError.raiseForStatusCode(requestResult);
    return responseObject['resource'];
  });
};

Client.prototype._performRequest = function (action, path, data, query) {
  var rq = request(action, this._baseUrl + '/' + path);
  if (query) {
    rq.query(query);
  }

  if (data) {
    rq.send(data);
  }

  if (this._secret) {
    rq.set('Authorization', secretHeader(this._secret));
  }

  rq.timeout(this._timeout);

  return new Promise(function (resolve, reject) {
    rq.end(function (error, result) {
      // superagent treates 4xx and 5xx status codes as exceptions. We'll handle those ourselves.
      if (error && error.response === undefined) {
        reject(error);
      } else if (error &&
          error.response &&
          !(error.response.status >= 400 && error.response.status <= 599)) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

function defaults(obj, def) {
  if (obj === undefined) {
    return def;
  } else {
    return obj;
  }
}

function secretHeader(secret) {
  return 'Basic ' + btoa(secret + ':');
}

module.exports = Client;
