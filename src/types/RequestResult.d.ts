export default class RequestResult<T extends object = object> {
  constructor(
    method: string,
    path: string,
    query: object,
    requestRaw: string,
    requestContent: object,
    responseRaw: string,
    responseContent: T,
    statusCode: number,
    responseHeaders: object,
    startTime: Date,
    endTime: Date
  )

  readonly method: string
  readonly path: string
  readonly query: object
  readonly requestRaw: string
  readonly requestContent: object
  readonly responseRaw: string
  readonly responseContent: T
  readonly statusCode: number
  readonly responseHeaders: object
  readonly startTime: Date
  readonly endTime: Date
  readonly timeTaken: number
}
