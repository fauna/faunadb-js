import RequestResult from './RequestResult'

export type FaunaHttpErrorResponseContent = {
  errors: {
    position: (string | number)[] 
    code: string,
    description: string
    cause?: FaunaHttpErrorResponseContent[];
  }[]
}
export module errors {
  export class FaunaError extends Error {
    constructor(message: string)

    name: string
    message: string
    description: string
  }

  export class InvalidValue extends FaunaError {}
  export class ClientClosed extends FaunaError {}
  export class FaunaHTTPError extends FaunaError {
    static raiseForStatusCode(requestResult: RequestResult<FaunaHttpErrorResponseContent>): void

    constructor(name: string, requestResult: RequestResult<FaunaHttpErrorResponseContent>)

    requestResult: RequestResult<FaunaHttpErrorResponseContent>
    errors(): object
  }

  export class BadRequest extends FaunaHTTPError {}
  export class Unauthorized extends FaunaHTTPError {}
  export class PermissionDenied extends FaunaHTTPError {}
  export class NotFound extends FaunaHTTPError {}
  export class MethodNotAllowed extends FaunaHTTPError {}
  export class InternalError extends FaunaHTTPError {}
  export class UnavailableError extends FaunaHTTPError {}
  export class TooManyRequests extends FaunaHTTPError {}
}
