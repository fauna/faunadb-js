import { fetch } from 'cross-fetch'
import { errors } from './errors'
import Expr from './Expr'
import PageHelper from './PageHelper'
import { ExprArg } from './query'
import RequestResult from './RequestResult'
import { Subscription } from './Stream'

type StreamEventFields = ['action', 'document', 'diff', 'prev']

export interface ClientConfig {
  secret: string
  domain?: string
  scheme?: 'http' | 'https'
  port?: number
  timeout?: number
  queryTimeout?: number
  observer?: <T extends object = object>(res: RequestResult<T | errors.FaunaHTTPError>, client: Client) => void
  keepAlive?: boolean
  headers?: { [key: string]: string | number }
  fetch?: typeof fetch
}

export interface QueryOptions {
  secret?: string
  queryTimeout?: number
}

export default class Client {
  constructor(opts?: ClientConfig)
  query<T extends object = object>(expr: ExprArg, options?: QueryOptions): Promise<T>
  paginate(expr: Expr, params?: object, options?: QueryOptions): PageHelper
  ping(scope?: string, timeout?: number): Promise<string>
  stream(expr: Expr, options?: { fields?: StreamEventFields[] }): Subscription
}
