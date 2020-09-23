'use strict'

var APIVersion = '4'

var parse = require('url-parse')
var util = require('./_util')

/**
 * The driver's internal HTTP client.
 *
 * @constructor
 * @param {Object} options Same as the {@link Client} options.
 * @private
 */
function HttpClient(options) {
  var isHttps = options.scheme === 'https'

  if (options.port === null) {
    options.port = isHttps ? 443 : 80
  }

  this._fetch = options.fetch || require('cross-fetch')
  this._baseUrl = options.scheme + '://' + options.domain + ':' + options.port
  this._timeout = Math.floor(options.timeout * 1000)
  this._secret = options.secret
  this._headers = options.headers
  this._queryTimeout = options.queryTimeout
  this._lastSeen = null

  if (util.isNodeEnv() && options.keepAlive) {
    this._keepAliveEnabledAgent = new (isHttps
      ? require('https')
      : require('http')
    ).Agent({ keepAlive: true })
  }
}

/**
 * Returns last seen transaction time.
 * @returns {number} The last seen transaction time.
 */
HttpClient.prototype.getLastTxnTime = function() {
  return this._lastSeen
}

/**
 * Sets the last seen transaction if the given timestamp is greater than then
 * know last seen timestamp.
 *
 * @param {number} A transaction timestamp.
 */
HttpClient.prototype.syncLastTxnTime = function(time) {
  if (this._lastSeen == null || this._lastSeen < time) {
    this._lastSeen = time
  }
}

/**
 * Executes an HTTP request.
 *
 * @param {string} method The HTTP request method.
 * @param {string} path The HTTP request path.
 * @param {?string} body The HTTP request body.
 * @param {?string} query The HTTP request query parameters.
 * @param {?Object} options The request options.
 * @param {?Object} options.signal An abort signal object.
 * @param {?Object} options.fetch A Fetch API compatible function.
 * @param {?string} options.secret A FaunaDB secret.
 * @param {?string} options.queryTimeout A FaunaDB query timeout.
 *
 * @returns {Promise} The response promise.
 */
HttpClient.prototype.execute = function(method, path, body, query, options) {
  var url = parse(this._baseUrl)
  url.set('pathname', path)
  url.set('query', query)
  options = util.defaults(options, {})

  var signal = options.signal
  var fetch = options.fetch || this._fetch
  var secret = options.secret || this._secret
  var queryTimeout = options.queryTimeout || this._queryTimeout

  var headers = this._headers
  headers['Authorization'] = secret && secretHeader(secret)
  headers['X-FaunaDB-API-Version'] = APIVersion
  headers['X-Fauna-Driver'] = 'Javascript'
  headers['X-Last-Seen-Txn'] = this._lastSeen
  headers['X-Query-Timeout'] = queryTimeout

  return fetch(url.href, {
    agent: this._keepAliveEnabledAgent,
    body: body,
    signal: signal,
    headers: util.removeNullAndUndefinedValues(headers),
    method: method,
    timeout: this._timeout,
  })
}

/** @ignore */
function secretHeader(secret) {
  return 'Bearer ' + secret
}

/**
 * Converts the given HTTP response headers into an object.
 *
 * @returns {Object} The response headers as an object.
 * @private
 */
function responseHeadersAsObject(response) {
  var headers = {}

  for (var header of response.headers.entries()) {
    var key = header[0]
    var value = header[1]
    headers[key] = value
  }

  return headers
}

module.exports = {
  HttpClient: HttpClient,
  responseHeadersAsObject: responseHeadersAsObject,
}
