'use strict'

var util = require('util')

/**
 * FaunaDB error types. Request errors can originate from
 * the client (e.g. bad method parameters) or from the FaunaDB Server (e.g.
 * invalid queries, timeouts.) Server errors will subclass
 * {@link module:errors~FaunaHTTPError}.
 *
 * @module errors
 */

/**
 * The base exception type for all FaunaDB errors.
 *
 * @param {string} message
 * @extends Error
 * @constructor
 */
function FaunaError(name, message) {
  Error.call(this)

  /**
   * Name of this exception.
   * @type {string}
   */
  this.name = name

  /**
   * Message for this exception.
   * @type {string}
   */
  this.message = message
}

util.inherits(FaunaError, Error)

/**
 * Exception thrown by this client library when an invalid
 * value is provided as a function argument.
 *
 * @extends module:errors~FaunaError
 * @constructor
 */
function InvalidValue(message) {
  FaunaError.call(this, 'InvalidValue', message)
}

util.inherits(InvalidValue, FaunaError)

/**
 * Exception thrown by this client library when an invalid
 * value is provided as a function argument.
 *
 * @extends module:errors~FaunaError
 * @constructor
 */
function InvalidArity(min, max, actual) {
  FaunaError.call(
    this,
    'InvalidArity',
    'Function requires ' +
      messageForArity(min, max) +
      ' arguments but ' +
      actual +
      ' were given.'
  )

  /**
   * Minimum number of arguments.
   * @type {number}
   */
  this.min = min

  /**
   * Maximum number of arguments.
   * @type {number}
   */
  this.max = max

  /**
   * Actual number of arguments called with.
   * @type {number}
   */
  this.actual = actual

  function messageForArity(min, max) {
    if (max === null) return 'at least ' + min
    if (min === null) return 'up to ' + max
    if (min === max) return min
    return 'from ' + min + ' to ' + max
  }
}

util.inherits(InvalidArity, FaunaError)

/**
 * Base exception type for errors returned by the FaunaDB server.
 *
 * @param {RequestResult} requestResult
 *
 * @extends module:errors~FaunaError
 * @constructor
 */
function FaunaHTTPError(name, requestResult) {
  var response = requestResult.responseContent
  var errors = response.errors
  var message = errors.length === 0 ? '(empty "errors")' : errors[0].code
  FaunaError.call(this, name, message)

  /**
   * A wrapped {@link RequestResult} object, containing the request and response
   * context of the failed request.
   *
   * @type {RequestResult}
   */
  this.requestResult = requestResult
}

util.inherits(FaunaHTTPError, FaunaError)

/**
 * Convenience method to return the errors from the response object.
 *
 * @returns {Object}
 */
FaunaHTTPError.prototype.errors = function() {
  return this.requestResult.responseContent.errors
}

/**
 * Takes a {@link RequestResult} and throws an appropriate exception if
 * it contains a failed request.
 *
 * @param requestResult {RequestResult}
 */
FaunaHTTPError.raiseForStatusCode = function(requestResult) {
  var code = requestResult.statusCode
  if (code < 200 || code >= 300) {
    switch (code) {
      case 400:
        throw new BadRequest(requestResult)
      case 401:
        throw new Unauthorized(requestResult)
      case 403:
        throw new PermissionDenied(requestResult)
      case 404:
        throw new NotFound(requestResult)
      case 405:
        throw new MethodNotAllowed(requestResult)
      case 500:
        throw new InternalError(requestResult)
      case 503:
        throw new UnavailableError(requestResult)
      default:
        throw new FaunaHTTPError('UnknownError', requestResult)
    }
  }
}

/**
 * A HTTP 400 error.
 *
 * @param {RequestResult} requestResult
 * @extends module:errors~FaunaHTTPError
 * @constructor
 */
function BadRequest(requestResult) {
  FaunaHTTPError.call(this, 'BadRequest', requestResult)
}

util.inherits(BadRequest, FaunaHTTPError)

/**
 * A HTTP 401 error.
 * @param {RequestResult} requestResult
 * @extends module:errors~FaunaHTTPError
 * @constructor
 */
function Unauthorized(requestResult) {
  FaunaHTTPError.call(this, 'Unauthorized', requestResult)
}

util.inherits(Unauthorized, FaunaHTTPError)

/**
 * A HTTP 403 error.
 * @param {RequestResult} requestResult
 * @extends module:errors~FaunaHTTPError
 * @constructor
 */
function PermissionDenied(requestResult) {
  FaunaHTTPError.call(this, 'PermissionDenied', requestResult)
}

util.inherits(PermissionDenied, FaunaHTTPError)

/**
 * A HTTP 404 error.
 * @param {RequestResult} requestResult
 * @extends module:errors~FaunaHTTPError
 * @constructor
 */
function NotFound(requestResult) {
  FaunaHTTPError.call(this, 'NotFound', requestResult)
}

util.inherits(NotFound, FaunaHTTPError)

/**
 * A HTTP 405 error.
 * @param {RequestResult} requestResult
 * @extends module:errors~FaunaHTTPError
 * @constructor
 */
function MethodNotAllowed(requestResult) {
  FaunaHTTPError.call(this, 'MethodNotAllowed', requestResult)
}

util.inherits(MethodNotAllowed, FaunaHTTPError)

/**
 * A HTTP 500 error.
 * @param {RequestResult} requestResult
 * @extends module:errors~FaunaHTTPError
 * @constructor
 */
function InternalError(requestResult) {
  FaunaHTTPError.call(this, 'InternalError', requestResult)
}

util.inherits(InternalError, FaunaHTTPError)

/**
 * A HTTP 503 error.
 * @param {RequestResult} requestResult
 * @extends module:errors~FaunaHTTPError
 * @constructor
 */
function UnavailableError(requestResult) {
  FaunaHTTPError.call(this, 'UnavailableError', requestResult)
}

util.inherits(UnavailableError, FaunaHTTPError)

module.exports = {
  FaunaHTTPError: FaunaHTTPError,
  InvalidValue: InvalidValue,
  InvalidArity: InvalidArity,
  BadRequest: BadRequest,
  Unauthorized: Unauthorized,
  PermissionDenied: PermissionDenied,
  NotFound: NotFound,
  MethodNotAllowed: MethodNotAllowed,
  InternalError: InternalError,
  UnavailableError: UnavailableError,
}
