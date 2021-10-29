import Expr from './Expr'

type StreamEventFields = ['action', 'document', 'diff', 'prev']

type StreamFn = (
  expr: Expr,
  options?: {
    fields?: StreamEventFields[]
  }
) => Subscription

export interface StreamApi extends StreamFn {
  document: StreamFn
}

export interface Subscription<TEventHandlerMap> {
  on: <T extends keyof TEventHandlerMap>(
    type: T,
    callback: TEventHandlerMap[T]
  ) => this
  start: () => this
  close: () => void
}

type Handler<TEventType extends string, TEventData> = (
  data: TEventData,
  event: {
    type: TEventType
    event: TEventData
    txn?: number
  }
) => void

export type SubscriptionEventHandlers = {
  start: Handler<'start', number>
  error: Handler<'error', unknown>
  version: Handler<
    'version',
    {
      action: 'create' | 'update' | 'delete'
      document?: object
      diff?: object
      prev?: object
    }
  >
  history_rewrite: Handler<
    'history_rewrite',
    {
      action: 'history_rewrite'
      document: object
    }
  >
  snapshot: Handler<'snapshot', object>
}
