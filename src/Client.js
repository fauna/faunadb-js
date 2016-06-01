var btoa = require('btoa-lite');
var request = require('superagent');
var errors = require('./errors');
var objects = require('./objects');
var json = require('./_json');
var RequestResult = require('./RequestResult');
var util = require('./_util');
var Promise = require('es6-promise').Promise;

/**
 * Directly communicates with FaunaDB via JSON.
 *
 * It is encouraged to pass e.g. {@link Ref} objects instead of raw JSON data.
 *
 * All methods return a converted JSON response.
 * This is an object containing Arrays, strings, and other objects.
 * Any {@link Ref}, {@link SetRef}, {@link FaunaTime}, or {@link FaunaDate}
 * values in it will also be parsed.
 * (So instead of `{ "@ref": "classes/frogs/123" }`,
 * you will get `new Ref("classes/frogs/123")`.)
 *
 * There is no way to automatically convert to any other type, such as {@link Event},
 * from the response; you'll have to do that yourself manually.
 */
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
 * @param {function(res: RequestResult): void} options.observer
 *   Callback that will be called after every completed request.
 */
function Client(options) {
  var opts = util.applyDefaults(options, {
    domain: 'rest.faunadb.com',
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
 * HTTP `GET`.
 * See the [docs](https://faunadb.com/documentation/rest).
 * @param {string|Ref} path Path relative the `domain` from the constructor.
 * @param {Object} query URL parameters.
 * @return {Promise<Object>} Converted JSON response.
 */
Client.prototype.get = function (path, query) {
  query = defaults(query, null);
  return this._execute('GET', path, null, query);
};

/**
 * HTTP `POST`.
 * See the [docs](https://faunadb.com/documentation/rest).
 * @param {string|Ref} path Path relative to the `domain` from the constructor.
 * @param {Object} data Object to be converted to request JSON.
 * @return {Promise<Object>} Converted JSON response.
 */
Client.prototype.post = function (path, data) {
  return this._execute('POST', path, data);
};

/**
 * Like {@link post}, but a `PUT` request.
 * See the [docs](https://faunadb.com/documentation/rest).
 */
Client.prototype.put = function (path, data) {
  return this._execute('PUT', path, data);
};

/**
 * Like {@link post}, but a `PATCH` request.
 * See the [docs](https://faunadb.com/documentation/rest).
 */
Client.prototype.patch = function (path, data) {
  return this._execute('PATCH', path, data);
};

/**
 * Like {@link post}, but a `DELETE` request.
 * See the [docs](https://faunadb.com/documentation/rest).
 */
Client.prototype.delete = function (path) {
  return this._execute('DELETE', path);
};

/**
 * Use the FaunaDB query API.
 * See the [docs](https://faunadb.com/documentation/queries)
 * and the query functions in this documentation.
 * @param expression {object} Created from query functions such as {@link add}.
 * @return {Promise<Object>} Server's response to the query.
 */
Client.prototype.query = function (expression) {
  return this._execute('POST', '', expression);
};

/**
 * Ping FaunaDB.
 * See the [docs](https://faunadb.com/documentation/rest#other).
 * @return {Promise<string>}
 */
Client.prototype.ping = function (scope, timeout) {
  return this.get('ping', { scope: scope, timeout: timeout });
};

Client.prototype._execute = function (action, path, data, query) {
  query = defaults(query, null);

  var serializedData = null;

  if (data !== null) {
    serializedData = json.toJSON(data);
  }

  if (path instanceof objects.Ref) {
    path = path.value;
  }

  if (query !== null) {
    query = util.removeUndefinedValues(query);
  }

  var startTime = Date.now();
  var self = this;
  return this._performRequest(action, path, serializedData, query).then(function (response) {
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
    rq.set('Content-Type', 'application/json');
  }

  if (this._secret) {
    rq.set('Authorization', secretHeader(this._secret));
  }

  rq.timeout(this._timeout);

  return new Promise(function (resolve, reject) {
    rq.end(function (error, result) {
      // superagent treates 4xx and 5xx status codes as exceptions. We'll handle those ourselves.
      if (error &&
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
  var str = 'pass' in secret ? secret.user + ':' + secret.pass : secret.user;
  return 'Basic ' + btoa(str);
}

module.exports = Client;
