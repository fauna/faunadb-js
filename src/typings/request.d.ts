declare module 'request' {
  const request: (options: RequestOptions, callback: (err: Error, response: Response, body: string) => void) => void
  export = request
}

declare type RequestOptions = {
  method?: string,
  baseUrl?: string,
  url?: string,
  auth?: {user: string, pass?: string},
  qs?: {[key: string]: string},
  body?: string,
  timeout: number
}

declare type Response = {
  headers: {[key: string]: string},
  statusCode: number
}
