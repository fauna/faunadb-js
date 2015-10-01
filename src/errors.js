/** Base class for all FaunaDB errors. */
export class FaunaError extends Error {}

/** Thrown when a query is malformed */
export class InvalidQuery extends FaunaError {}

/** Thrown when a value can not be accepted. */
export class InvalidValue extends FaunaError {}

/** Thrown when the FaunaDB server responds with an error. */
export class FaunaHTTPError extends FaunaError {
  constructor(response_object) {
    const errors = 'error' in response_object ?
      [response_object['error']] :
      response_object['errors']
    const reason = response_object.reason
    super(reason || errors[0].code)
    this.errors = errors
    this.reason = reason
    this.parameters = response_object.parameters
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
