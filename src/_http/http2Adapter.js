'use strict'
var http2 = require('http2')
var errors = require('./errors')
var util = require('../_util')

// Destroy session after 0.5 seconds of inactivity.
var DESTROY_HTTP2_SESSION_TIME = 500
var STREAM_PREFIX = 'stream::'

/**
 * Http client adapter built around NodeJS http2 module.
 *
 * @constructor
 * @private
 */
function Http2Adapter() {
  /**
   * Identifies a type of adapter.
   *
   * @type {string}
   */
  this.type = 'http2'
  /**
   * Serves for reusing http2 sessions between multiple calls.
   *
   * @type {object}
   * @private
   */
  this._sessionMap = {}
}

Http2Adapter.prototype._sessionKey = function(origin, isStreaming) {
  return isStreaming ? STREAM_PREFIX + origin : origin
}

/**
 * Resolves ClientHttp2Session to be reused across multiple requests.
 *
 * @param {string} origin Request origin to connect to.
 * @param {?boolean} isStreaming Whether it's a streaming request. A separate session
 * is created for streaming requests to avoid shared resources with regular
 * ones for the purpose of reliability.
 * @returns {ClientHttp2Session} Http2 session.
 */
Http2Adapter.prototype._resolveSession = function(origin, sessionKey) {
  if (!this._sessionMap[sessionKey]) {
    var self = this
    var cleanupSession = function() {
      self._cleanupSession(sessionKey)
    }

    // Initializing http2 session.
    this._sessionMap[sessionKey] = {
      activeRequests: 0,
      session: http2
        .connect(origin)
        .once('error', cleanupSession)
        .once('goaway', cleanupSession),
      idleTimer: null,
    }
  }

  // We're about to make use of the session, so cancel the idle timer if it was
  // going.
  this._clearIdleTimer(sessionKey)

  return this._sessionMap[sessionKey]
}

/**
 * Performs cleanup for broken session.
 *
 * @param {string} origin Request origin to connect to.
 * @param {?boolean} isStreaming Whether it's a streaming request.
 * @returns {void}
 */
Http2Adapter.prototype._cleanupSession = function(sessionKey) {
  if (this._sessionMap[sessionKey]) {
    this._clearIdleTimer(sessionKey)
    this._sessionMap[sessionKey].session.close()
    delete this._sessionMap[sessionKey]
  }
}

Http2Adapter.prototype._clearIdleTimer = function(sessionKey) {
  if (this._sessionMap[sessionKey].idleTimer) {
    clearTimeout(this._sessionMap[sessionKey].idleTimer)
    delete this._sessionMap[sessionKey].idleTimer
  }
}

Http2Adapter.prototype._refreshIdleTimer = function(sessionKey) {
  this._clearIdleTimer(sessionKey)

  var self = this
  var idleCleanup = function() {
    if (self._sessionMap[sessionKey].activeRequests === 0) {
      self._cleanupSession(sessionKey)
    }
  }

  // Start the idle timer iff we have no active requests.
  if (this._sessionMap[sessionKey].activeRequests === 0) {
    this._sessionMap[sessionKey].idleTimer = setTimeout(
      idleCleanup,
      DESTROY_HTTP2_SESSION_TIME
    )
  }
}

Http2Adapter.prototype._decrementActiveRequests = function(sessionKey) {
  --this._sessionMap[sessionKey].activeRequests
}

Http2Adapter.prototype._incrementActiveRequests = function(sessionKey) {
  ++this._sessionMap[sessionKey].activeRequests
}

/**
 * Issues http requests using http2 module.
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
Http2Adapter.prototype.execute = function(options) {
  var self = this
  var isStreaming = options.streamConsumer != null
  var sessionKey = this._sessionKey(options.origin, isStreaming)

  return new Promise(function(resolvePromise, rejectPromise) {
    var isPromiseSettled = false
    var isCanceled = false

    var resolve = function(value) {
      isPromiseSettled = true
      resolvePromise(value)
    }

    // If an error has occurred after the Promise is settled
    // we need to call streamConsumer.onError instead of reject function.
    // Possible scenario is aborting request when stream is already being consumed.
    var rejectOrOnError = function(error) {
      if (isPromiseSettled && isStreaming) {
        return options.streamConsumer.onError(error)
      }

      isPromiseSettled = true
      rejectPromise(error)
    }

    var cleanup = function() {
      self._decrementActiveRequests(sessionKey)

      // Destroys http2 session after specified time of inactivity and
      // releases event loop.
      self._refreshIdleTimer(sessionKey)

      if (options.signal) {
        options.signal.removeEventListener('abort', onAbort)
      }
    }

    var onError = function(error) {
      cleanup()
      rejectOrOnError(error)
    }

    var onAbort = function() {
      isCanceled = true
      cleanup()
      request.close(http2.constants.NGHTTP2_CANCEL)
      rejectOrOnError(new errors.AbortError())
    }

    var onTimeout = function() {
      isCanceled = true
      cleanup()
      request.close(http2.constants.NGHTTP2_CANCEL)
      rejectOrOnError(new errors.TimeoutError())
    }

    var onResponse = function(responseHeaders) {
      var status = responseHeaders[http2.constants.HTTP2_HEADER_STATUS]
      var isOkStatus = status >= 200 && status < 400
      var processStream = isOkStatus && isStreaming
      var responseBody = ''

      var onData = function(chunk) {
        if (processStream) {
          return options.streamConsumer.onData(chunk)
        }

        responseBody += chunk
      }

      var onEnd = function() {
        cleanup()

        if (!processStream) {
          return resolve({
            body: responseBody,
            headers: responseHeaders,
            status: status,
          })
        }

        // Call .onError with TypeError only if the request hasn't been canceled
        // in order to align on how FetchAdapter works - it throws the TypeError
        // due to underlying fetch API mechanics.
        if (!isCanceled) {
          options.streamConsumer.onError(new TypeError('network error'))
        }
      }

      if (processStream) {
        resolve({
          // Syntactic stream representation.
          body: '[stream]',
          headers: responseHeaders,
          status: status,
        })
      }

      request.on('data', onData).on('end', onEnd)
    }

    try {
      var pathname =
        (options.path[0] === '/' ? options.path : '/' + options.path) +
        util.querystringify(options.query, '?')
      var requestHeaders = Object.assign({}, options.headers, {
        [http2.constants.HTTP2_HEADER_PATH]: pathname,
        [http2.constants.HTTP2_HEADER_METHOD]: options.method,
      })
      var session = self._resolveSession(options.origin, sessionKey).session
      var request = session
        .request(requestHeaders)
        .setEncoding('utf8')
        .on('error', onError)
        .on('response', onResponse)
      self._incrementActiveRequests(sessionKey)

      // Set up timeout only if no signal provided.
      if (!options.signal && options.timeout) {
        request.setTimeout(options.timeout, onTimeout)
      }

      if (options.signal) {
        options.signal.addEventListener('abort', onAbort)
      }

      if (options.body != null) {
        request.write(options.body)
      }

      request.end()
    } catch (error) {
      self._cleanupSession(sessionKey)
      rejectOrOnError(error)
    }
  })
}

module.exports = Http2Adapter
