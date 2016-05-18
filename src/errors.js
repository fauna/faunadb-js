"use strict";

var util = require("util");

function FaunaError() {
}

/** Thrown when a query is malformed */
function InvalidQuery() {

}

/** Thrown when a value can not be accepted. */
function InvalidValue() {

}

/** Thrown when the FaunaDB server responds with an error. */
function FaunaHTTPError(requestResult) {
  var result;
  Object.defineProperty(this, "requestResult", {
    get: function () {
      return result;
    },
    set: function (res) {
      result = res;
    }
  });

  Object.defineProperty(this, "errors", {
    get: function () {
      return result.response.errors;
    }
  });

  // super(errors.length === 0 ? '(empty `errors`)' : errors[0].code)
  // TODO: Message
  
  this.requestResult = requestResult;
}

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
  BadRequest.super_.apply(this, requestResult);
}

/** HTTP 401 error. */
function Unauthorized(requestResult) {
  Unauthorized.super_.apply(this, requestResult);
}

/** HTTP 403 error. */
function PermissionDenied() {

}

/** HTTP 404 error. */
function NotFound() {

}

/** HTTP 405 error. */
function MethodNotAllowed() {

}

/** HTTP 500 error. */
function InternalError() {

}

/** HTTP 503 error. */
function UnavailableError() {

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
  Error: Error
};
