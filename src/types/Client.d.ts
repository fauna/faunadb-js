import Expr from './Expr'
import PageHelper from './PageHelper'
import RequestResult from './RequestResult'

export interface ClientConfig {
  domain?: string
  scheme?: 'http' | 'https'
  port?: number
  secret: string
  timeout?: number
  observer?: (res: RequestResult, client: Client) => void
  keepAlive?: boolean
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
