import { fetch } from 'cross-fetch'
import { errors } from './errors'
import Expr from './Expr'
import PageHelper from './PageHelper'
import { ExprArg } from './query'
import RequestResult from './RequestResult'
import { Subscription, SubscriptionEventHandlers } from './Stream'

type StreamEventFields = 'action' | 'document' | 'diff' | 'prev' | 'index'

export interface ClientConfig {
  secret: string
  endpoint?: string
  domain?: string
  scheme?: 'http' | 'https'
  port?: number
  timeout?: number
  queryTimeout?: number
  observer?: <T extends object = object>(
    res: RequestResult<T | errors.FaunaHTTPError>,
    client: Client
  ) => void
  keepAlive?: boolean
  headers?: { [key: string]: string | number }
  fetch?: typeof fetch
  http2SessionIdleTime?: number
  checkNewVersion?: boolean
  metrics?: boolean
}

export interface QueryOptions
  extends Partial<
    Pick<
      ClientConfig,
      'secret' | 'queryTimeout' | 'fetch' | 'observer'
    >
  > {
  signal?: AbortSignal
  traceparent?: string
  tags?: { [key: string]: string }
}

type StreamFn<T> = (
  expr: Expr,
  options?: {
    fields?: StreamEventFields[]
  }
) => Subscription<T>

interface StreamApi
  extends StreamFn<Omit<SubscriptionEventHandlers, 'snapshot'>> {
  document: StreamFn<SubscriptionEventHandlers>
}

interface MetricsResponse<T = object> {
  value: T
  metrics: {
    'x-compute-ops': number
    'x-byte-read-ops': number
    'x-byte-write-ops': number
    'x-query-time': number
    'x-txn-retries': number
  }
}

export default class Client {
  constructor(opts?: ClientConfig)
  query<T = object>(expr: ExprArg, options?: QueryOptions): Promise<T>
  queryWithMetrics<T = object>(
    expr: ExprArg,
    options?: QueryOptions
  ): Promise<MetricsResponse<T>>
  paginate(expr: Expr, params?: object, options?: QueryOptions): PageHelper
  ping(scope?: string, timeout?: number): Promise<string>
  close(opts?: { force?: boolean }): Promise<void>
  stream: StreamApi
}
