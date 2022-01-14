'use strict'
require('abort-controller/polyfill')
var util = require('../_util')
var faunaErrors = require('../errors')
var errors = require('./errors')

/**
 * Http client adapter built around fetch API.
 *
 * @constructor
 * @param {?object} options FetchAdapter options.
 * @param {?boolean} options.keepAlive Whether use keep-alive connection.
 * @param {?boolean} options.isHttps Whether use https connection.
 * @param {?function} options.fetch Fetch compatible API.
 * @private
 */
function FetchAdapter(options) {
  options = options || {}

  /**
   * Identifies a type of adapter.
   *
   * @type {string}
   */
  this.type = 'fetch'
  /**
   * Indicates whether the .close method has been called.
   *
   * @type {boolean}
   * @private
   */
  this._closed = false
  this._fetch = util.resolveFetch(options.fetch)
  /**
   * A map that tracks ongoing requests to be able to cancel them when
   * the .close method is called.
   *
   * @type {Map<Object, Object>}
   * @private
   */
  this._pendingRequests = new Map()

  if (util.isNodeEnv() && options.keepAlive) {
    this._keepAliveEnabledAgent = new (options.isHttps
      ? require('https')
      : require('http')
    ).Agent({ keepAlive: true })
  }
}

/**
 * Issues http requests using fetch API.
 *
 * @param {object} options Request options.
 * @param {string} options.origin Request origin.
 * @param {string} options.path Request path.
 * @param {?object} options.query Request query.
 * @param {string} options.method Request method.
 * @param {?object} options.headers Request headers.
 * @param {?string} options.body Request body utf8 string.
 * @params {?object} options.streamConsumer Stream consumer.
 * @param {?object} options.signal Abort signal object.
 * @param {?number} options.timeout Request timeout.
 * @returns {Promise} Request result.
 */
FetchAdapter.prototype.execute = function(options) {
  if (this._closed) {
    return Promise.reject(
      new faunaErrors.ClientClosed(
        'The Client has already been closed',
        'No subsequent requests can be issued after the .close method is called. ' +
          'Consider creating a new Client instance'
      )
    )
  }

  var self = this
  var timerId = null
  var isStreaming = options.streamConsumer != null
  // Use timeout only if no signal provided
  var useTimeout = !options.signal && !!options.timeout
  var ctrl = new AbortController()
  var pendingRequest = {
    isStreaming: isStreaming,
    isAbortedByClose: false,
    // This callback can be set during the .close method call to be notified
    // on request ending to resolve .close's Promise only after all of the requests complete.
    onComplete: null,
  }

  self._pendingRequests.set(ctrl, pendingRequest)

  var onComplete = function() {
    self._pendingRequests.delete(ctrl)

    if (options.signal) {
      options.signal.removeEventListener('abort', onAbort)
    }

    if (pendingRequest.onComplete) {
      pendingRequest.onComplete()
    }
  }

  var onSettle = function() {
    if (timerId) {
      clearTimeout(timerId)
    }
  }

  var onResponse = function(response) {
    onSettle()

    var headers = responseHeadersAsObject(response.headers)
    var processStream = isStreaming && response.ok

    // Regular request - return text content immediately.
    if (!processStream) {
      onComplete()

      return response.text().then(function(content) {
        return {
          body: content,
          headers: headers,
          status: response.status,
        }
      })
    }

    attachStreamConsumer(response, options.streamConsumer, onComplete)

    return {
      // Syntactic stream representation.
      body: '[stream]',
      headers: headers,
      status: response.status,
    }
  }

  var onError = function(error) {
    onSettle()
    onComplete()

    return Promise.reject(
      remapIfAbortError(error, function() {
        if (!isStreaming && pendingRequest.isAbortedByClose) {
          return new faunaErrors.ClientClosed(
            'The request is aborted due to the Client#close ' +
              'call with the force=true option'
          )
        }

        return useTimeout ? new errors.TimeoutError() : new errors.AbortError()
      })
    )
  }

  var onAbort = function() {
    ctrl.abort()
  }

  if (useTimeout) {
    timerId = setTimeout(function() {
      timerId = null
      ctrl.abort()
    }, options.timeout)
  }

  if (options.signal) {
    options.signal.addEventListener('abort', onAbort)
  }

  return this._fetch(
    util.formatUrl(options.origin, options.path, options.query),
    {
      method: options.method,
      headers: options.headers,
      body: options.body,
      agent: this._keepAliveEnabledAgent,
      signal: ctrl.signal,
    }
  )
    .then(onResponse)
    .catch(onError)
}

/**
 * Moves to the closed state, aborts streaming requests.
 * Aborts non-streaming requests if force is true,
 * waits until they complete otherwise.
 *
 * @param {?object} opts Close options.
 * @param {?boolean} opts.force Whether to force resources clean up.
 * @returns {Promise<void>}
 */
FetchAdapter.prototype.close = function(opts) {
  opts = opts || {}

  this._closed = true

  var promises = []

  var abortOrWait = function(pendingRequest, ctrl) {
    var shouldAbort = pendingRequest.isStreaming || opts.force

    if (shouldAbort) {
      pendingRequest.isAbortedByClose = true

      return ctrl.abort()
    }

    promises.push(
      new Promise(function(resolve) {
        pendingRequest.onComplete = resolve
      })
    )
  }

  this._pendingRequests.forEach(abortOrWait)

  var noop = function() {}

  return Promise.all(promises).then(noop)
}

/**
 * Attaches streamConsumer specifically either for browser or NodeJS.
 * Minimum browser compatibility based on current code:
 * Chrome                52
 * Edge                  79
 * Firefox               65
 * IE                    NA
 * Opera                 39
 * Safari                10.1
 * Android Webview       52
 * Chrome for Android    52
 * Firefox for Android   65
 * Opera for Android     41
 * Safari on iOS         10.3
 * Samsung Internet      6.0
 *
 * @param {object} response Fetch response.
 * @param {object} consumer StreamConsumer.
 * @param {function} onComplete Callback fired when the stream ends or errors.
 * @private
 */
function attachStreamConsumer(response, consumer, onComplete) {
  var onError = function(error) {
    onComplete()
    consumer.onError(remapIfAbortError(error))
  }

  if (util.isNodeEnv()) {
    response.body
      .on('error', onError)
      .on('data', consumer.onData)
      .on('end', function() {
        onComplete()
        // To simulate how browsers behave in case of "end" event.
        consumer.onError(new TypeError('network error'))
      })

    return
  }

  // ATTENTION: The following code is meant to run in browsers and is not
  // covered by current test automation. Manual testing on major browsers
  // is required after making changes to it.
  try {
    var reader = response.body.getReader()
    var decoder = new TextDecoder('utf-8')

    function pump() {
      return reader.read().then(function(msg) {
        if (!msg.done) {
          var chunk = decoder.decode(msg.value, { stream: true })

          consumer.onData(chunk)

          return pump()
        }

        onComplete()
        // In case a browser hasn't thrown the "network error" on stream's end
        // we need to force it in order to provide a way to handle stream's
        // ending.
        consumer.onError(new TypeError('network error'))
      })
    }

    pump().catch(onError)
  } catch (err) {
    throw new faunaErrors.StreamsNotSupported(
      'Please, consider providing a Fetch API-compatible function ' +
        'with streamable response bodies. ' +
        err
    )
  }
}

/**
 * Remaps an AbortError thrown by fetch to HttpClient's one
 * for timeout and abort use-cases.
 *
 * @param {Error} error Error object.
 * @param {?function} errorFactory A factory called to construct an abort error.
 * @returns {Error} Remapped or original error.
 * @private
 */
function remapIfAbortError(error, errorFactory) {
  var isAbortError = error && error.name === 'AbortError'

  if (!isAbortError) {
    return error
  }

  if (errorFactory) {
    return errorFactory()
  }

  return new errors.AbortError()
}

/**
 * Converts fetch Headers object into POJO.
 *
 * @param {object} headers Fetch Headers object.
 * @returns {object} Response headers as a plain object.
 * @private
 */
function responseHeadersAsObject(headers) {
  var result = {}

  for (var header of headers.entries()) {
    var key = header[0]
    var value = header[1]

    result[key] = value
  }

  return result
}

module.exports = FetchAdapter
