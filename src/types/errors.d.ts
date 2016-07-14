import RequestResult from "./RequestResult";

export module errors {
  export class FaunaError extends Error {
    constructor(message: String);

    name: string;
    message: string;
  }

  export class InvalidValue extends FaunaError {}

  export class FaunaHttpError extends FaunaError {
    static raiseForStatusCode(requestResult: RequestResult): void;

    constructor(requestResult: RequestResult);

    requestResult: RequestResult;
    errors(): Object;
  }

  export class BadRequest extends FaunaHttpError {}
  export class Unauthorized extends FaunaHttpError {}
  export class PermissionDenied extends FaunaHttpError {}
  export class NotFound extends FaunaHttpError {}
  export class MethodNotAllowed extends FaunaHttpError {}
  export class InternalError extends FaunaHttpError {}
  export class UnavailableError extends FaunaHttpError {}
}
