import Expr from './Expr'
import PageHelper from './PageHelper'
import RequestResult from './RequestResult'

export interface ClientConfig {
  secret: string
  domain?: string
  scheme?: 'http' | 'https'
  port?: number
  timeout?: number
  observer?: (res: RequestResult, client: Client) => void
  keepAlive?: boolean
  headers?: { [key: string]: string | number }
  fetch?: typeof fetch
}

export interface QueryOptions {
  secret?: string
}

export default class Client {
  constructor(opts?: ClientConfig)
  query<T = object>(expr: Expr, options?: QueryOptions): Promise<T>
  paginate(expr: Expr, params?: object, options?: QueryOptions): PageHelper
  ping(scope?: string, timeout?: number): Promise<string>
}
