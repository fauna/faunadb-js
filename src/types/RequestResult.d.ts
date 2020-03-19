export default class RequestResult {
  constructor(
    method: string,
    path: string,
    query: object,
    requestRaw: string,
    requestContent: object,
    responseRaw: string,
    responseContent: object,
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
  readonly responseContent: object
  readonly statusCode: number
  readonly responseHeaders: object
  readonly startTime: Date
  readonly endTime: Date
  readonly timeTaken: number
}
