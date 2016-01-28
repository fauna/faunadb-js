/** Base class for all FaunaDB errors. */
export class FaunaError extends Error {}

/** Thrown when a query is malformed */
export class InvalidQuery extends FaunaError {}

/** Thrown when a value can not be accepted. */
export class InvalidValue extends FaunaError {}

/** Thrown when the FaunaDB server responds with an error. */
export class FaunaHTTPError extends FaunaError {
  constructor(requestResult) {
    const response = requestResult.responseContent
    const errors = response.errors
    super(errors.length === 0 ? '(empty `errors`)' : errors[0].code)
    /** @type {RequestResult} */
    this.requestResult = requestResult
    // todo: list of ErrorData objects
    this.errors = errors
  }

  static raiseForStatusCode(requestResult) {
    const code = requestResult.statusCode
    if (200 <= code && code <= 299)
      return requestResult.resource
    else
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
          throw new FaunaHTTPError(requestResult)
      }
  }
}

/** HTTP 400 error. */
export class BadRequest extends FaunaHTTPError {}

/** HTTP 401 error. */
export class Unauthorized extends FaunaHTTPError {}

/** HTTP 403 error. */
export class PermissionDenied extends FaunaHTTPError {}

/** HTTP 404 error. */
export class NotFound extends FaunaHTTPError {}

/** HTTP 405 error. */
export class MethodNotAllowed extends FaunaHTTPError {}

/** HTTP 500 error. */
export class InternalError extends FaunaHTTPError {}

/** HTTP 503 error. */
export class UnavailableError extends FaunaHTTPError {}
