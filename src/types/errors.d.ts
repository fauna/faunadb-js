import RequestResult from './RequestResult'

export module errors {
  export class FaunaError extends Error {
    constructor(message: string)

    name: string
    message: string
  }

  export class InvalidValue extends FaunaError {}

  export class FaunaHTTPError extends FaunaError {
    static raiseForStatusCode(requestResult: RequestResult): void

    constructor(requestResult: RequestResult)

    requestResult: RequestResult
    errors(): object
  }

  export class BadRequest extends FaunaHTTPError {}
  export class Unauthorized extends FaunaHTTPError {}
  export class PermissionDenied extends FaunaHTTPError {}
  export class NotFound extends FaunaHTTPError {}
  export class MethodNotAllowed extends FaunaHTTPError {}
  export class InternalError extends FaunaHTTPError {}
  export class UnavailableError extends FaunaHTTPError {}
}
