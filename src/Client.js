'use strict'

var PageHelper = require('./PageHelper')
var RequestResult = require('./RequestResult')
var errors = require('./errors')
var http = require('./_http')
var json = require('./_json')
var query = require('./query')
var util = require('./_util')
var values = require('./values')

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
 * (So if a response contains `{ "@ref": "collections/frogs/123" }`,
 * it will be returned as `new Ref("collections/frogs/123")`.)
 *
 * @constructor
 * @param {?Object} options
 *   Object that configures this FaunaDB client.
 * @param {?string} options.domain
 *   Base URL for the FaunaDB server.
 * @param {?{ string: string }} options.headers
 *   Base URL for the FaunaDB server.
 * @param {?('http'|'https')} options.scheme
 *   HTTP scheme to use.
 * @param {?number} options.port
 *   Port of the FaunaDB server.
 * @param {?string} options.secret FaunaDB secret (see [Reference Documentation](https://app.fauna.com/documentation/intro/security))
 * @param {?number} options.timeout Read timeout in seconds.
 * @param {?Client~observerCallback} options.observer
 *   Callback that will be called after every completed request.
 * @param {?boolean} options.keepAlive
 *   Configures http/https keepAlive option (ignored in browser environments)
 * @param {?fetch} options.fetch
 *   a fetch compatible [API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) for making a request
 * @param {?number} options.queryTimeout
 *   Sets the maximum amount of time (in milliseconds) for query execution on the server,
 */
function Client(options) {
  options = util.applyDefaults(options, {
    domain: 'db.fauna.com',
    scheme: 'https',
    port: null,
    secret: null,
    timeout: 60,
    observer: null,
    keepAlive: true,
    headers: {},
    fetch: undefined,
    queryTimeout: null,
  })

  this._observer = options.observer
  this._http = new http.HttpClient(options)
}

/**
 * Executes a query via the FaunaDB Query API.
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi),
 * and the query functions in this documentation.
 * @param expression {ExprArg}
 *   The query to execute. Created from query functions such as {@link add}.
 * @param {?Object} options
 *   Object that configures the current query, overriding FaunaDB client options.
 * @param {?string} options.secret FaunaDB secret (see [Reference Documentation](https://app.fauna.com/documentation/intro/security))
 * @return {external:Promise<Object>} FaunaDB response object.
 */
Client.prototype.query = function(expression, options) {
  return this._execute('POST', '', query.wrap(expression), null, options)
}

/**
 * Returns a {@link PageHelper} for the given Query expression.
 * This provides a helpful API for paginating over FaunaDB responses.
 * @param expression {Expr}
 *   The Query expression to paginate over.
 * @param params {Object}
 *   Options to be passed to the paginate function. See [paginate](https://app.fauna.com/documentation/reference/queryapi#read-functions).
 * @param options {?Object}
 *   Object that configures the current pagination queries, overriding FaunaDB client options.
 * @param {?string} options.secret FaunaDB secret (see [Reference Documentation](https://app.fauna.com/documentation/intro/security))
 * @returns {PageHelper} A PageHelper that wraps the provided expression.
 */
Client.prototype.paginate = function(expression, params, options) {
  params = util.defaults(params, {})
  options = util.defaults(options, {})

  return new PageHelper(this, expression, params, options)
}

/**
 * Sends a `ping` request to FaunaDB.
 * @return {external:Promise<string>} Ping response.
 */
Client.prototype.ping = function(scope, timeout) {
  return this._execute('GET', 'ping', null, { scope: scope, timeout: timeout })
}

/**
 * Get the freshest timestamp reported to this client.
 * @returns {number} the last seen transaction time
 */
Client.prototype.getLastTxnTime = function() {
  return this._http.getLastTxnTime()
}

/**
 * Sync the freshest timestamp seen by this client.
 *
 * This has no effect if staler than currently stored timestamp.
 * WARNING: This should be used only when coordinating timestamps across
 *          multiple clients. Moving the timestamp arbitrarily forward into
 *          the future will cause transactions to stall.
 * @param time {number} the last seen transaction time
 */
Client.prototype.syncLastTxnTime = function(time) {
  this._http.syncLastTxnTime(time)
}

Client.prototype._execute = function(method, path, data, query, options) {
  query = util.defaults(query, null)

  if (
    path instanceof values.Ref ||
    util.checkInstanceHasProperty(path, '_isFaunaRef')
  ) {
    path = path.value
  }

  if (query !== null) {
    query = util.removeUndefinedValues(query)
  }

  var startTime = Date.now()
  var self = this
  var body =
    ['GET', 'HEAD'].indexOf(method) >= 0 ? undefined : JSON.stringify(data)
  return this._http
    .execute(method, path, body, query, options)
    .then(function(response) {
      return response.text().then(function(responseText) {
        var endTime = Date.now()
        var responseObject = json.parseJSON(responseText)
        var headers = http.responseHeadersAsObject(response)
        var result = new RequestResult(
          method,
          path,
          query,
          body,
          data,
          responseText,
          responseObject,
          response.status,
          headers,
          startTime,
          endTime
        )
        self._handleRequestResult(response, result)
        return responseObject['resource']
      })
    })
}

Client.prototype._handleRequestResult = function(response, result) {
  var txnTimeHeaderKey = 'x-txn-time'

  if (response.headers.has(txnTimeHeaderKey)) {
    this.syncLastTxnTime(parseInt(response.headers.get(txnTimeHeaderKey), 10))
  }

  if (this._observer !== null) {
    this._observer(result, this)
  }

  errors.FaunaHTTPError.raiseForStatusCode(result)
}

module.exports = Client
