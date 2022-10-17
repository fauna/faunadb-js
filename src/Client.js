'use strict'

var packageJson = require('../package.json')
var PageHelper = require('./PageHelper')
var RequestResult = require('./RequestResult')
var errors = require('./errors')
var http = require('./_http')
var json = require('./_json')
var query = require('./query')
var stream = require('./stream')
var util = require('./_util')
var values = require('./values')

/**
 * The callback that will be executed after every completed request.
 *
 * @callback Client~observerCallback
 * @param {RequestResult} res
 */

/**
 * **WARNING: This is an experimental feature. There are no guarantees to
 * its API stability and/or service availability. DO NOT USE IT IN
 * PRODUCTION**.
 *
 * Creates a subscription to the result of the given read-only expression. When
 * executed, the expression must only perform reads and produce a single
 * streamable type, such as a reference or a version. Expressions that attempt
 * to perform writes or produce non-streamable types will result in an error.
 * Otherwise, any expression can be used to initiate a stream, including
 * user-defined function calls.
 *
 * The subscription returned by this method does not issue any requests until
 * the {@link module:stream~Subscription#start} method is called. Make sure to
 * subscribe to the events of interest, otherwise the received events are simply
 * ignored. For example:
 *
 * ```
 * client.stream(document.ref)
 *   .on('version', version => console.log(version))
 *   .on('error', error => console.log(error))
 *   .start()
 * ```
 *
 * Please note that streams are not temporal, meaning that there is no option to
 * configure its starting timestamp. The stream will, however, state its initial
 * subscription time via the {@link module:stream~Subscription#event:start}
 * event. A common programming mistake is to read a document, then initiate a
 * subscription. This approach can miss events that occurred between the initial
 * read and the subscription request. To prevent event loss, make sure the
 * subscription has started before performing a data load. The following example
 * buffer events until the document's data is loaded:
 *
 * ```
 * var buffer = []
 * var loaded = false
 *
 * client.stream(document.ref)
 *   .on('start', ts => {
 *     loadData(ts).then(data => {
 *       processData(data)
 *       processBuffer(buffer)
 *       loaded = true
 *     })
 *   })
 *   .on('version', version => {
 *     if (loaded) {
 *       processVersion(version)
 *     } else {
 *       buffer.push(version)
 *     }
 *   })
 *   .start()
 * ```
 *
 * The reduce boilerplate, the `document` helper implements a similar
 * functionality, except it discards events prior to the document's snapshot
 * time. The expression given to this helper must be a reference as it
 * internally runs a {@link module:query~Get} call with it. The example above
 * can be rewritten as:
 *
 * ```
 * client.stream.document(document.ref)
 *   .on('snapshot', data => processData(data))
 *   .on('version', version => processVersion(version))
 *   .start()
 * ```
 *
 * Be aware that streams are not available in all browsers. If the client can't
 * initiate a stream, an error event with the {@link
 * module:errors~StreamsNotSupported} error will be emmited.
 *
 * To stop a subscription, call the {@link module:stream~Subscription#close}
 * method:
 *
 * ```
 * var subscription = client.stream(document.ref)
 *   .on('version', version => processVersion(version))
 *   .start()
 *
 * // ...
 * subscription.close()
 * ```
 *
 * @param {module:query~ExprArg} expression
 *   The expression to subscribe to. Created from {@link module:query}
 *   functions.
 *
 * @param {?module:stream~Options} options
 *   Object that configures the stream.
 *
 * @property {function} document
 *  A document stream helper. See {@link Client#stream} for more information.
 *
 * @see module:stream~Subscription
 *
 * @function
 * @name Client#stream
 * @returns {module:stream~Subscription} A new subscription instance.
 */

/**
 * A client for interacting with FaunaDB.
 *
 * Users will mainly call the {@link Client#query} method to execute queries, or
 * the {@link Client#stream} method to subscribe to streams.
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
 * @param {?string} options.endpoint
 *   Full URL for the FaunaDB server.
 * @param {?string} options.domain
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
 * @param {?{ string: string }} options.headers
 *   Optional headers to send with requests
 * @param {?fetch} options.fetch
 *   a fetch compatible [API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) for making a request
 * @param {?number} options.queryTimeout
 *   Sets the maximum amount of time (in milliseconds) for query execution on the server
 * @param {?number} options.http2SessionIdleTime
 *   Sets the maximum amount of time (in milliseconds) an HTTP2 session may live
 *   when there's no activity. Must be a non-negative integer, with a maximum value of 5000.
 *   If an invalid value is passed a default of 500 ms is applied. If a value
 *   exceeding 5000 ms is passed (e.g. Infinity) the maximum of 5000 ms is applied.
 *   Only applicable for NodeJS environment (when http2 module is used).
 *   can also be configured via the FAUNADB_HTTP2_SESSION_IDLE_TIME environment variable
 *   which has the highest priority and overrides the option passed into the Client constructor.
 * @param {?boolean} options.checkNewVersion
 *   Enabled by default. Prints a message to the terminal when a newer driver is available.
 * @param {?boolean} options.metrics
 *   Disabled by default. Controls whether or not query metrics are returned.
 */
function Client(options) {
  const http2SessionIdleTime = getHttp2SessionIdleTime(
    options ? options.http2SessionIdleTime : undefined
  )

  if (options) options.http2SessionIdleTime = http2SessionIdleTime

  options = util.applyDefaults(options, {
    endpoint: null,
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
    http2SessionIdleTime,
    checkNewVersion: false,
  })

  this._observer = options.observer
  this._http = new http.HttpClient(options)
  this.stream = stream.StreamAPI(this)
}

/**
 * Current API version.
 *
 * @type {string}
 */
Client.apiVersion = packageJson.apiVersion

/**
 * Executes a query via the FaunaDB Query API.
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi),
 * and the query functions in this documentation.
 * @param expression {module:query~ExprArg}
 *   The query to execute. Created from {@link module:query} functions.
 * @param {?Object} options
 *   Object that configures the current query, overriding FaunaDB client options.
 * @param {?string} options.secret FaunaDB secret (see [Reference Documentation](https://app.fauna.com/documentation/intro/security))
 * @return {external:Promise<Object>} FaunaDB response object.
 */
Client.prototype.query = function(expression, options) {
  query.arity.between(1, 2, arguments, 'Client.prototype.query')
  options = Object.assign({}, this._globalQueryOptions, options)
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

/**
 * Closes the client session and cleans up any held resources.
 * By default, it will wait for any ongoing requests to complete on their own;
 * streaming requests are terminated forcibly. Any subsequent requests will
 * error after the .close method is called.
 * Should be used at application termination in order to release any open resources
 * and allow the process to terminate e.g. when the custom http2SessionIdleTime parameter is used.
 *
 * @param {?object} opts Close options.
 * @param {?boolean} opts.force Specifying this property will force any ongoing
 * requests to terminate instead of gracefully waiting until they complete.
 * This may result in an ERR_HTTP2_STREAM_CANCEL error for NodeJS.
 * @returns {Promise<void>}
 */
Client.prototype.close = function(opts) {
  return this._http.close(opts)
}

/**
 * Executes a query via the FaunaDB Query API.
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi),
 * and the query functions in this documentation.
 * @param expression {module:query~ExprArg}
 *   The query to execute. Created from {@link module:query} functions.
 * @param {?Object} options
 *   Object that configures the current query, overriding FaunaDB client options.
 * @param {?string} options.secret FaunaDB secret (see [Reference Documentation](https://app.fauna.com/documentation/intro/security))
 * @return {external:Promise<Object>} {value, metrics} An object containing the FaunaDB response object and the list of query metrics incurred by the request.
 */
Client.prototype.queryWithMetrics = function(expression, options) {
  query.arity.between(1, 2, arguments, 'Client.prototype.query')
  return this._execute('POST', '', query.wrap(expression), null, options, true)
}

Client.prototype._execute = function(
  method,
  path,
  data,
  query,
  options,
  returnMetrics = false
) {
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
    .execute(
      Object.assign({}, options, {
        path: path,
        query: query,
        method: method,
        body: body,
      })
    )
    .then(function(response) {
      var endTime = Date.now()
      var responseObject = json.parseJSON(response.body)
      var result = new RequestResult(
        method,
        path,
        query,
        body,
        data,
        response.body,
        responseObject,
        response.status,
        response.headers,
        startTime,
        endTime
      )
      self._handleRequestResult(response, result, options)

      const metricsHeaders = [
        'x-compute-ops',
        'x-byte-read-ops',
        'x-byte-write-ops',
        'x-query-time',
        'x-txn-retries',
      ]

      if (returnMetrics) {
        return {
          value: responseObject['resource'],
          metrics: Object.fromEntries(
            Array.from(Object.entries(response.headers))
              .filter(([k, v]) => metricsHeaders.includes(k))
              .map(([k, v]) => [k, parseInt(v)])
          ),
        }
      } else {
        return responseObject['resource']
      }
    })
}

Client.prototype._handleRequestResult = function(response, result, options) {
  var txnTimeHeaderKey = 'x-txn-time'

  if (response.headers[txnTimeHeaderKey] != null) {
    this.syncLastTxnTime(parseInt(response.headers[txnTimeHeaderKey], 10))
  }

  var observers = [this._observer, options && options.observer]

  observers.forEach(observer => {
    if (typeof observer == 'function') {
      observer(result, this)
    }
  })

  errors.FaunaHTTPError.raiseForStatusCode(result)
}

function getHttp2SessionIdleTime(configuredIdleTime) {
  const maxIdleTime = 5000
  const defaultIdleTime = 500
  const envIdleTime = util.getEnvVariable('FAUNADB_HTTP2_SESSION_IDLE_TIME')

  var value = defaultIdleTime
  // attemp to set the idle time to the env value and then the configured value
  const values = [envIdleTime, configuredIdleTime]
  for (const rawValue of values) {
    const parsedValue =
      rawValue === 'Infinity' ? Number.MAX_SAFE_INTEGER : parseInt(rawValue, 10)
    const isNegative = parsedValue < 0
    const isGreaterThanMax = parsedValue > maxIdleTime
    // if we didn't get infinity or a positive integer move to the next value
    if (isNegative || !parsedValue) continue
    // if we did get something valid constrain it to the ceiling
    value = parsedValue
    if (isGreaterThanMax) value = maxIdleTime
    break
  }

  return value
}

module.exports = Client
