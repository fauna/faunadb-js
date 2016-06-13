'use strict';

var util = require('util');
/**
 * Errors
 * @module errors
 */


/**
 *
 * @param message
 * @constructor
 */

function FaunaError(message) {
  Error.call(this);
  this.name = this.constructor.name;
  this.message = message;
}

util.inherits(FaunaError, Error);

/** Thrown when a query is malformed */
function InvalidQuery() {
  FaunaError.call(this, arguments);
}

util.inherits(InvalidQuery, FaunaError);

/** Thrown when a value can not be accepted. */
function InvalidValue() {
  FaunaError.call(this, arguments);
}

util.inherits(InvalidValue, FaunaError);

/** Thrown when the FaunaDB server responds with an error. */
function FaunaHTTPError(requestResult) {
  var response = requestResult.responseContent;
  var errors = response.errors;
  var message = errors.length === 0 ? '(empty "errors")' : errors[0].code;
  FaunaError.call(this, message);

  this.requestResult = requestResult;
}

util.inherits(FaunaHTTPError, FaunaError);

FaunaHTTPError.prototype.errors = function() {
  return this.requestResult.responseContent.errors;
};

FaunaHTTPError.raiseForStatusCode = function (requestResult) {
  var code = requestResult.statusCode;
  if (code < 200 || code >= 300) {
    switch (code) {
      case 400:
        throw new BadRequest(requestResult);
      case 401:
        throw new Unauthorized(requestResult);
      case 403:
        throw new PermissionDenied(requestResult);
      case 404:
        throw new NotFound(requestResult);
      case 405:
        throw new MethodNotAllowed(requestResult);
      case 500:
        throw new InternalError(requestResult);
      case 503:
        throw new UnavailableError(requestResult);
      default:
        throw new FaunaHTTPError(requestResult);
    }
  }
};

/** HTTP 400 error. */
function BadRequest(requestResult) {
  FaunaHTTPError.call(this, requestResult);
}

util.inherits(BadRequest, FaunaHTTPError);

/** HTTP 401 error. */
function Unauthorized(requestResult) {
  FaunaHTTPError.call(this, requestResult);
}

util.inherits(Unauthorized, FaunaHTTPError);

/** HTTP 403 error. */
function PermissionDenied(requestResult) {
  FaunaHTTPError.call(this, requestResult);
}

util.inherits(PermissionDenied, FaunaHTTPError);

/** HTTP 404 error. */
function NotFound(requestResult) {
  FaunaHTTPError.call(this, requestResult);
}

util.inherits(NotFound, FaunaHTTPError);

/** HTTP 405 error. */
function MethodNotAllowed(requestResult) {
  FaunaHTTPError.call(this, requestResult);
}

util.inherits(MethodNotAllowed, FaunaHTTPError);

/** HTTP 500 error. */
function InternalError(requestResult) {
  FaunaHTTPError.call(this, requestResult);
}

util.inherits(InternalError, FaunaHTTPError);

/** HTTP 503 error. */
function UnavailableError(requestResult) {
  FaunaHTTPError.call(this, requestResult);
}

util.inherits(UnavailableError, FaunaHTTPError);

module.exports = {
  FaunaHTTPError: FaunaHTTPError,
  InvalidValue: InvalidValue,
  InvalidQuery: InvalidQuery,
  BadRequest: BadRequest,
  Unauthorized: Unauthorized,
  PermissionDenied: PermissionDenied,
  NotFound: NotFound,
  MethodNotAllowed: MethodNotAllowed,
  InternalError: InternalError,
  UnavailableError: UnavailableError
};
