'use strict'
var util = require('../_util')

/**
 * Thrown by HttpClient when request hits specified timeout.
 *
 * @param {?string} message
 * @extends Error
 * @constructor
 */
function TimeoutError(message) {
  Error.call(this)

  this.message = message || 'Request aborted due to timeout'
  this.isTimeoutError = true
}

util.inherits(TimeoutError, Error)

/**
 * Thrown by HttpClient when request is aborted via Signal interface.
 *
 * @param {?string} message
 * @extends Error
 * @constructor
 */
function AbortError(message) {
  Error.call(this)

  this.message = message || 'Request aborted'
  this.isAbortError = true
}

util.inherits(AbortError, Error)

module.exports = {
  TimeoutError: TimeoutError,
  AbortError: AbortError,
}
