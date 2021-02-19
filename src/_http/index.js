'use strict'
var packageJson = require('../../package.json')
var util = require('../_util')
var errors = require('./errors')

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
  var useHttp2Adapter = !options.fetch && util.isNodeEnv() && isHttp2Supported()

  this._adapter = useHttp2Adapter
    ? new (require('./http2Adapter'))()
    : new (require('./fetchAdapter'))({
        isHttps: isHttps,
        fetch: options.fetch,
        keepAlive: options.keepAlive,
      })
  this._baseUrl = options.scheme + '://' + options.domain + ':' + options.port
  this._secret = options.secret
  this._headers = Object.assign({}, options.headers, getDefaultHeaders())
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
 * @param {?object} options Request parameters.
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

  var secret = options.secret || this._secret
  var queryTimeout = options.queryTimeout || this._queryTimeout
  var headers = this._headers

  headers['Authorization'] = secret && secretHeader(secret)
  headers['X-Last-Seen-Txn'] = this._lastSeen
  headers['X-Query-Timeout'] = queryTimeout

  return this._adapter.execute({
    origin: this._baseUrl,
    path: options.path || '/',
    query: options.query,
    method: options.method || 'GET',
    headers: util.removeNullAndUndefinedValues(headers),
    body: options.body,
    signal: options.signal,
    timeout: this._timeout,
    streamConsumer: options.streamConsumer,
  })
}

function secretHeader(secret) {
  return 'Bearer ' + secret
}

/** @ignore */
function getDefaultHeaders() {
  var headers = {
    'X-Fauna-Driver': 'Javascript',
    'X-FaunaDB-API-Version': packageJson.apiVersion,
  }

  if (util.isNodeEnv()) {
    // TODO: should be at the browser as well. waiting to enable CORS headers
    headers['X-Fauna-Driver-Version'] = packageJson.version
    headers['X-Runtime-Environment'] = getNodeRuntimeEnv()
    headers['X-Runtime-Environment-OS'] = require('os').platform()
    headers['X-NodeJS-Version'] = process.version
  } else {
    // TODO: uncomment when CORS enabled
    // var browser = require('browser-detect')()
    // headers['X-Runtime-Environment'] = browser.name
    // headers['X-Runtime-Environment-Version'] = browser.version
    // headers['X-Runtime-Environment-OS'] = browser.os
  }

  return headers
}

function isHttp2Supported() {
  try {
    require('http2')

    return true
  } catch (_) {
    return false
  }
}

/**
 * For checking process.env always use `hasOwnProperty`
 * Some providers could throw an error when trying to access env variables that does not exists
 * @ignore */
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
      check: () =>
        process.env.hasOwnProperty('PATH') &&
        process.env.PATH.indexOf('.heroku') !== -1,
    },
    {
      name: 'AWS Lambda',
      check: () => process.env.hasOwnProperty('AWS_LAMBDA_FUNCTION_VERSION'),
    },
    {
      name: 'GCP Cloud Functions',
      check: () =>
        process.env.hasOwnProperty('_') &&
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
        process.env.hasOwnProperty('ORYX_ENV_TYPE') &&
        process.env.hasOwnProperty('WEBSITE_INSTANCE_ID') &&
        process.env.ORYX_ENV_TYPE === 'AppService',
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

  return detectedEnv ? detectedEnv.name : 'Unknown'
}

module.exports = {
  HttpClient: HttpClient,
  TimeoutError: errors.TimeoutError,
  AbortError: errors.AbortError,
}
