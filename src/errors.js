'use strict';

var util = require('util');

function FaunaError(message) {
  Error.call(this);
  this.name = this.constructor.name;
  this.message = message;
}

/** Thrown when a query is malformed */
function InvalidQuery() {
  FaunaError.call(this, arguments);
}

/** Thrown when a value can not be accepted. */
function InvalidValue() {
  FaunaError.call(this, arguments);
}

/** Thrown when the FaunaDB server responds with an error. */
function FaunaHTTPError(requestResult) {
  var response = requestResult.responseContent;
  var errors = response.errors;
  var message = errors.length === 0 ? '(empty "errors")' : errors[0].code;
  FaunaError.call(this, message);

  this.requestResult = requestResult;
}

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

/** HTTP 401 error. */
function Unauthorized(requestResult) {
  FaunaHTTPError.call(this, requestResult);
}

/** HTTP 403 error. */
function PermissionDenied(requestResult) {
  FaunaHTTPError.call(this, requestResult);
}

/** HTTP 404 error. */
function NotFound(requestResult) {
  FaunaHTTPError.call(this, requestResult);
}

/** HTTP 405 error. */
function MethodNotAllowed(requestResult) {
  FaunaHTTPError.call(this, requestResult);
}

/** HTTP 500 error. */
function InternalError(requestResult) {
  FaunaHTTPError.call(this, requestResult);
}

/** HTTP 503 error. */
function UnavailableError(requestResult) {
  FaunaHTTPError.call(this, requestResult);
}

util.inherits(FaunaError, Error);
util.inherits(InvalidQuery, FaunaError);
util.inherits(InvalidValue, FaunaError);
util.inherits(FaunaHTTPError, FaunaError);
util.inherits(BadRequest, FaunaHTTPError);
util.inherits(Unauthorized, FaunaHTTPError);
util.inherits(PermissionDenied, FaunaHTTPError);
util.inherits(NotFound, FaunaHTTPError);
util.inherits(MethodNotAllowed, FaunaHTTPError);
util.inherits(InternalError, FaunaHTTPError);
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
