import RequestResult from './RequestResult'

export type FaunaHttpErrorResponseContent = {
  errors: {
    code: string,
    description: string
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
    code: string
    position: string[]
    httpStatusCode: number
    errors(): object
  }

  export class BadRequest extends FaunaHTTPError {}
  export class FunctionCallError extends FaunaHTTPError {}
  export class Unauthorized extends FaunaHTTPError {}
  export class PermissionDenied extends FaunaHTTPError {}
  export class NotFound extends FaunaHTTPError {}
  export class MethodNotAllowed extends FaunaHTTPError {}
  export class InternalError extends FaunaHTTPError {}
  export class UnavailableError extends FaunaHTTPError {}
  export class InvalidArity extends FaunaHTTPError {}
  export class PayloadTooLarge extends FaunaHTTPError {}
  export class ValidationError extends FaunaHTTPError {}
  export class TooManyRequests extends FaunaHTTPError {}
  export class StreamError extends FaunaHTTPError {}
  export class StreamsNotSupported extends FaunaHTTPError {}
  export class StreamErrorEvent extends FaunaHTTPError {}
  export class InvalidArgumentError extends FaunaHTTPError {}
  export class InvalidExpressionError extends FaunaHTTPError {}
  export class InvalidUrlParameterError extends FaunaHTTPError {}
  export class SchemaNotFoundError extends FaunaHTTPError {}
  export class TransactionAbortedError extends FaunaHTTPError {}
  export class InvalidWriteTimeError extends FaunaHTTPError {}
  export class InvalidReferenceError extends FaunaHTTPError {}
  export class MissingIdentityError extends FaunaHTTPError {}
  export class InvalidScopeError extends FaunaHTTPError {}
  export class InvalidTokenError extends FaunaHTTPError {}
  export class StackOverflowError extends FaunaHTTPError {}
  export class ValueNotFoundError extends FaunaHTTPError {}
  export class InstanceNotFound extends FaunaHTTPError {}
  export class InstanceAlreadyExistsError extends FaunaHTTPError {}
  export class InstanceNotUniqueError extends FaunaHTTPError {}
  export class InvalidObjectInContainerError extends FaunaHTTPError {}
  export class MoveDatabaseError extends FaunaHTTPError {}
  export class RecoveryFailedError extends FaunaHTTPError {}
  export class FeatureNotAvailableError extends FaunaHTTPError {}
  export class TooManyRequests extends FaunaHTTPError {}
}
