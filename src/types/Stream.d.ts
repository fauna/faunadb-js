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
  event: { type: TEventType; txn: number; event: TEventData }
) => void

export type SubscriptionEventHandlers = {
  start: Handler<'start', number>
  error: Handler<
    'error',
    {
      code: string
      description: string
    }
  >
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
