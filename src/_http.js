'use strict'

var parse = require('url-parse')
var util = require('./_util')
var pjson = require('../package.json')
var AbortController = require('abort-controller')

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

  this._fetch = resolveFetch(options.fetch, true)
  this._baseUrl = options.scheme + '://' + options.domain + ':' + options.port
  this._timeout = Math.floor(options.timeout * 1000)
  this._secret = options.secret
  this._headers = util.applyDefaults(options.headers, {
    'X-Fauna-Driver': 'Javascript',
    'X-FaunaDB-API-Version': pjson.apiVersion,
  })

  // FaunaDB server doesn't whitelist headers below for CORS
  // As soon as it whitelisted, we can apply them
  // via `this._headers = util.applyDefaults` for browser as well
  if (util.isNodeEnv()) {
    this._headers['X-Fauna-Driver-Version'] = pjson.version
    this._headers['X-Runtime-Environment'] = util.isNodeEnv()
      ? getNodeRuntimeEnv()
      : navigator.userAgent
    this._headers['X-NodeJS-Version'] = process.version
  }

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
  headers['X-Last-Seen-Txn'] = this._lastSeen
  headers['X-Query-Timeout'] = queryTimeout

  console.debug('request headers for ')
  console.debug(headers)

  var timeout
  if (!signal && this._timeout) {
    var abortController = new AbortController()
    signal = abortController.signal
    timeout = setTimeout(abortController.abort, this._timeout)
  }

  console.debug('before fetch')
  console.debug(util.removeNullAndUndefinedValues(headers))
  return fetch(url.href, {
    agent: this._keepAliveEnabledAgent,
    body: body,
    signal: signal,
    headers: util.removeNullAndUndefinedValues(headers),
    method: method,
  })
    .then(function(response) {
      console.info('fetch success')
      clearTimeout(timeout)
      return response
    })
    .catch(function(error) {
      console.info('fetch error')
      clearTimeout(timeout)
      throw error
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

/**
 * Resolve which Fetch API compatible function to use. If an override is
 * provided, it returns the override. If no override, and the `preferPolyfill`
 * is `true`, returns the cross-fetch polyfill. If no override and
 * `preferPolyfill` is `false`, then attempts to return the fetch function from
 * the global (window) environment. Returns `null` otherwise.
 *
 * This function embeds two boolean values into the returned function:
 * * override: Set to `true` when a fetch function override is given;
 * * polyfill: Set to `true` when the cross-fetch polyfill is returned.
 *
 * The meta information embedded into the return function is used, for example,
 * by the {@link module:stream~StreamClient} to determine if the resolved fetch
 * function is appropriate for its internal network calls since the cross-fetch
 * library does not support streaming in its browser polyfill, and its build
 * [removes](https://github.com/lquixada/cross-fetch/blob/v3.0.4/rollup.config.js#L36)
 * such information from its wrapped libraries
 *
 * @param {function} fetchOverride
 *   An Fetch API compatible function to use.
 * @param {boolean} preferPolyfill
 *   If `true`, prefers the cross-fetch polyfill over native browser API.
 *
 * @private
 * @returns {?function} A Fetch API compatible function.
 */
function resolveFetch(fetchOverride, preferPolyfill) {
  var delegate = null
  var override = false

  if (typeof fetchOverride === 'function') {
    override = true
    delegate = fetchOverride
  } else if (preferPolyfill) {
    delegate = require('cross-fetch')
  } else if (typeof global.fetch === 'function') {
    delegate = global.fetch
  }

  if (delegate !== null) {
    var fetch = function() {
      // NB. Rebinding to global is needed for Safari.
      return delegate.apply(global, arguments)
    }
    fetch.polyfill = true
    fetch.override = override
    return fetch
  }

  return null
}

/** @ignore */
function getNodeRuntimeEnv() {
  var runtimeEnvs = [
    {
      name: 'Netlify',
      check: () => process.env.hasOwnProperty('NETLIFY_IMAGES_CDN_DOMAIN'),
    },
    {
      name: 'Vercel',
      check: () => process.env.hasOwnProperty('VERCEL'),
    },
    {
      name: 'Heroku',
      check: () => process.env.PATH.indexOf('.heroku') !== -1,
    },
    {
      name: 'AWS Lambda',
      check: () => process.env.hasOwnProperty('AWS_LAMBDA_FUNCTION_VERSION'),
    },
    {
      name: 'GCP Cloud Functions',
      check: () =>
        process.env.hasOwnProperty('FUNCTION_TARGET') &&
        process.env._.indexOf('google') !== -1,
    },
    {
      name: 'GCP Compute Instances',
      check: () => process.env.hasOwnProperty('GOOGLE_CLOUD_PROJECT'),
    },
    {
      name: 'Azure Cloud Functions',
      check: () =>
        process.env.hasOwnProperty('WEBSITE_FUNCTIONS_AZUREMONITOR_CATEGORIES'),
    },
    {
      name: 'Azure Compute',
      check: () =>
        process.env.ORYX_ENV_TYPE === 'AppService' &&
        process.env.WEBSITE_INSTANCE_ID,
    },
    {
      name: 'Worker',
      check: () => {
        try {
          return global instanceof ServiceWorkerGlobalScope
        } catch (error) {
          return false
        }
      },
    },
    {
      name: 'Mongo Stitch',
      check: () => typeof global.StitchError === 'function',
    },
    {
      name: 'Render',
      check: () => process.env.hasOwnProperty('RENDER_SERVICE_ID'),
    },
    {
      name: 'Begin',
      check: () => process.env.hasOwnProperty('BEGIN_DATA_SCOPE_ID'),
    },
  ]

  var detectedEnv = runtimeEnvs.find(env => env.check())
  return detectedEnv ? detectedEnv.name : require('os').platform()
}

module.exports = {
  HttpClient: HttpClient,
  responseHeadersAsObject: responseHeadersAsObject,
  resolveFetch: resolveFetch,
}
