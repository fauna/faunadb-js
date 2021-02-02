'use strict'
var parse = require('url-parse')
var util = require('../_util')
var errors = require('./errors')

var APIVersion = '4'

/**
 * The driver's internal HTTP client.
 *
 * @constructor
 * @param {Object} options Same as the {@link Client} options.
 * @private
 */
function HttpClient(options) {
  var isHttps = options.scheme === 'https'

  if (options.port == null) {
    options.port = isHttps ? 443 : 80
  }

  // HTTP2 adapter is applicable only if it's NodeJS env and
  // no fetch API override provided (to preserve backward-compatibility).
  var useHttp2Adapter = !options.fetch && util.isNodeEnv()

  this._adapter = useHttp2Adapter
    ? new (require('./http2Adapter'))()
    : new (require('./fetchAdapter'))({
        isHttps: isHttps,
        fetch: options.fetch,
        keepAlive: options.keepAlive,
      })
  this._baseUrl = options.scheme + '://' + options.domain + ':' + options.port
  this._secret = options.secret
  this._headers = options.headers
  this._queryTimeout = options.queryTimeout
  this._lastSeen = null
  this._timeout = Math.floor(options.timeout * 1000)
}

/**
 * Returns last seen transaction time.
 *
 * @returns {number} The last seen transaction time.
 */
HttpClient.prototype.getLastTxnTime = function() {
  return this._lastSeen
}

/**
 * Sets the last seen transaction if the given timestamp is greater than then
 * know last seen timestamp.
 *
 * @param {number} time transaction timestamp.
 */
HttpClient.prototype.syncLastTxnTime = function(time) {
  if (this._lastSeen == null || this._lastSeen < time) {
    this._lastSeen = time
  }
}

/**
 * Executes an HTTP request.
 *
 * @param {object} options Request parameters.
 * @param {?string} options.method Request method.
 * @param {?string} options.path Request path.
 * @param {?string} options.body Request body.
 * @param {?object} options.query Request query.
 * @params {?object} options.streamConsumer Stream consumer, if presented
 * the request will be "streamed" into streamConsumer.onData function.
 * @params {function} options.streamConsumer.onData Function called with a chunk of data.
 * @params {function} options.streamConsumer.onError Function called
 * when an error occurred.
 * when the stream is ended.
 * @param {?object} options.signal Abort signal object.
 * @param {?object} options.fetch Fetch API compatible function.
 * @param {?object} options.secret FaunaDB secret.
 * @param {?object} options.queryTimeout FaunaDB query timeout.
 * @returns {Promise} The response promise.
 */
HttpClient.prototype.execute = function(options) {
  options = options || {}

  var invalidStreamConsumer =
    options.streamConsumer &&
    (typeof options.streamConsumer.onData !== 'function' ||
      typeof options.streamConsumer.onError !== 'function')

  if (invalidStreamConsumer) {
    return Promise.reject(new TypeError('Invalid "streamConsumer" provided'))
  }

  var url = parse(this._baseUrl)
    .set('pathname', options.path || '')
    .set('query', options.query || {})
  var secret = options.secret || this._secret
  var queryTimeout = options.queryTimeout || this._queryTimeout
  var headers = this._headers

  headers['Authorization'] = secret && secretHeader(secret)
  headers['X-FaunaDB-API-Version'] = APIVersion
  headers['X-Fauna-Driver'] = 'Javascript'
  headers['X-Last-Seen-Txn'] = this._lastSeen
  headers['X-Query-Timeout'] = queryTimeout

  return this._adapter.execute({
    url: url,
    method: options.method || 'GET',
    headers: util.removeNullAndUndefinedValues(headers),
    body: options.body,
    signal: options.signal,
    timeout: this._timeout,
    streamConsumer: options.streamConsumer,
  })
}

/** @ignore */
function secretHeader(secret) {
  return 'Bearer ' + secret
}

module.exports = {
  HttpClient: HttpClient,
  TimeoutError: errors.TimeoutError,
  AbortError: errors.AbortError,
}
