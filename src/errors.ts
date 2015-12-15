/** Base class for all FaunaDB errors. */
export class FaunaError extends Error {
  constructor(message: string) {
    super(message)
  }
}

/** Thrown when a query is malformed */
export class InvalidQuery extends FaunaError {}

/** Thrown when a value can not be accepted. */
export class InvalidValue extends FaunaError {}

/** Thrown when the FaunaDB server responds with an error. */
export class FaunaHTTPError extends FaunaError {
  errors: Array<any>
  reason: string
  parameters: any

  constructor(responseObject: any) {
    const errors = 'error' in responseObject ?
      [responseObject.error] :
      responseObject.errors
    const reason = responseObject.reason
    super(reason || errors[0].code || errors[0])
    this.errors = errors
    this.reason = reason
    this.parameters = responseObject.parameters
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
