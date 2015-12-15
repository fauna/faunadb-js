import {env} from 'process'
import * as request from 'request'
import * as winston from 'winston'
import {BadRequest, FaunaHTTPError, InternalError, MethodNotAllowed, NotFound,
  PermissionDenied, Unauthorized, UnavailableError} from './errors'
import {Ref} from './objects'
import {Query} from './query'
import {toJSON, parseJSON} from './_json'
import {applyDefaults, removeUndefinedValues} from './_util'

const debugLogger: any = env.FAUNA_DEBUG || env.NODE_DEBUG === 'fauna' ? winston : null

/**
Directly communicates with FaunaDB via JSON.

It is encouraged to pass e.g. [[Ref]] objects instead of raw JSON data.

All methods return a converted JSON response.
This is an object containing Arrays, strings, and other objects.
Any [[Ref]], [[FaunaSet]], [[FaunaTime]], or [[FaunaDate]]
values in it will also be parsed.
(So instead of `{ "@ref": "classes/frogs/123" }`,
you will get `new Ref("classes/frogs/123")`.)

There is no way to automatically convert to any other type, such as [[Event]],
from the response; you'll have to do that yourself manually.
*/
export default class Client {
  private baseUrl: string
  private timeout: number
  private secret: Auth
  private logger: any

  /**
  @param options.domain Base URL for the FaunaDB server.
  @param options.scheme HTTP scheme to use: 'http' or 'https'.
  @param options.port Port of the FaunaDB server.
  @param options.secret
    Auth token for the FaunaDB server.
    Passed straight to [request](https://github.com/request/request#http-authentication).
  @param options.timeout Read timeout in seconds.
  @param options.logger A [winston](https://github.com/winstonjs/winston) Logger
  */
  constructor(options: ClientOptions) {
    const opts = applyDefaults(options, {
      domain: 'rest.faunadb.com',
      scheme: 'https',
      port: null,
      secret: null,
      timeout: 60,
      logger: null
    })

    if (opts.port === null)
      opts.port = opts.scheme === 'https' ? 443 : 80

    this.baseUrl = `${opts.scheme}://${opts.domain}:${opts.port}`
    this.timeout = Math.floor(opts.timeout * 1000)
    this.secret = opts.secret
    this.logger = opts.logger
  }

  /**
  HTTP `GET`.
  See the [docs](https://faunadb.com/documentation/rest).
  @param path Path relative the `domain` from the constructor.
  @param query URL parameters.
  @return Converted JSON response.
  */
  get(path: Ref | string, query: HttpQuery = null): Promise<any> {
    return this.execute('GET', path, null, query)
  }

  /**
  HTTP `POST`.
  See the [docs](https://faunadb.com/documentation/rest).
  @param path Path relative to the `domain` from the constructor.
  @param data Object to be converted to request JSON.
  @return Converted JSON response.
  */
  post(path: Ref | string, data: any): Promise<any> {
    return this.execute('POST', path, data)
  }

  /**
  Like [[post]], but a `PUT` request.
  See the [docs](https://faunadb.com/documentation/rest).
  */
  put(path: Ref | string, data: any): Promise<any> {
    return this.execute('PUT', path, data)
  }

  /**
  Like [[post]], but a `PATCH` request.
  See the [docs](https://faunadb.com/documentation/rest).
  */
  patch(path: Ref | string, data: any): Promise<any> {
    return this.execute('PATCH', path, data)
  }

  /**
  Like [[post]], but a `DELETE` request.
  See the [docs](https://faunadb.com/documentation/rest).
  */
  delete(path: Ref | string): Promise<any> {
    return this.execute('DELETE', path)
  }

  /**
  Use the FaunaDB query API.
  See the [docs](https://faunadb.com/documentation/queries)
  and the query functions in this documentation.
  @return Server's response to the query.
  */
  query(expression: Query): Promise<any> {
    return this.execute('POST', '', expression)
  }

  /**
  Ping FaunaDB.
  See the [docs](https://faunadb.com/documentation/rest#other).
  */
  ping(scope: string = undefined, timeout: number = undefined): Promise<any> {
    return this.get('ping', {scope, timeout})
  }

  private log(indented: boolean, logged: string): void {
    if (indented) {
      const indentStr = '  '
      logged = indentStr + logged.split('\n').join(`\n${indentStr}`)
    }

    if (debugLogger !== null)
      debugLogger.info(logged)
    if (this.logger !== null)
      this.logger.info(logged)
  }

  private async execute(
    action: string,
    path: Ref | string,
    data: any = null,
    query: HttpQuery = null): Promise<any> {
    const strPath: string = typeof path === 'string' ? path : path.value
    if (query !== null) {
      query = removeUndefinedValues(query)
      if (Object.keys(query).length === 0)
        query = null
    }

    if (this.logger === null && debugLogger === null) {
      const {response, body} = await this.execute_without_logging(action, strPath, data, query)
      return handleResponse(response, parseJSON(body))
    } else {
      const realTimeBegin = Date.now()
      const {response, body} = await this.execute_without_logging(action, strPath, data, query)
      const realTime = Date.now() - realTimeBegin

      this.log(false, `Fauna ${action} /${path}${queryStringForLogging(query)}`)
      this.log(true, `Credentials: ${JSON.stringify(this.secret)}`)
      if (data)
        this.log(true, `Request JSON: ${toJSON(data, true)}`)

      const headersJson = toJSON(response.headers, true)
      const responseObject = parseJSON(body)
      const responseJson = toJSON(responseObject, true)
      this.log(true, `Response headers: ${headersJson}`)
      this.log(true, `Response JSON: ${responseJson}`)
      const
        statusCode = response.statusCode,
        apiTime = response.headers['x-http-request-processing-time'],
        latency = Math.floor(realTime)
      this.log(true,
        `Response (${statusCode}): API processing ${apiTime}ms, network latency ${latency}ms`)
      return handleResponse(response, responseObject)
    }
  }

  private execute_without_logging(
    action: string,
    path: string,
    data: any, query: any): Promise<{response: any, body: string}> {
    return new Promise(
      (resolve: (_: {response: Response, body: string}) => void, reject: (_: Error) => void) => {
      // request has a bug when trying to request empty path.
      if (path === '')
        path = '/'

      const opts = {
        method: action,
        baseUrl: this.baseUrl,
        url: path,
        auth: this.secret,
        qs: query,
        body: data === null ? null : toJSON(data),
        timeout: this.timeout
      }

      request(opts, (err: Error, response: Response, body: string) => {
        if (err)
          reject(err)
        else
          resolve({response, body})
      })
    })
  }
}
// KLUDGE - fixed in typescript 1.8
exports.default = Client

export type Auth = {user: string, pass?: string}

export type ClientOptions = {
  domain?: string,
  scheme?: string,
  port?: number,
  secret?: Auth,
  timeout?: number,
  logger?: any
}

export type HttpQuery = {[key: string]: any}

function handleResponse(response: Response, responseObject: any): any {
  const code = response.statusCode
  if (200 <= code && code <= 299)
    return responseObject.resource
  else
    switch (code) {
      case 400:
        throw new BadRequest(responseObject)
      case 401:
        throw new Unauthorized(responseObject)
      case 403:
        throw new PermissionDenied(responseObject)
      case 404:
        throw new NotFound(responseObject)
      case 405:
        throw new MethodNotAllowed(responseObject)
      case 500:
        throw new InternalError(responseObject)
      case 503:
        throw new UnavailableError(responseObject)
      default:
        throw new FaunaHTTPError(responseObject)
    }
}

function queryStringForLogging(query: HttpQuery): string {
  return query === null ?
    '' :
    `?${Object.keys(query).map((key: string) => `${key}=${query[key]}`).join('&')}`
}
