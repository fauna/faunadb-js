import Client from './Client'
import { ExprArg } from './query'
import { values } from './values'

export interface Subscription {
  on: <T extends keyof SubscriptionEventHandlers>(
    type: T,
    callback: SubscriptionEventHandlers[T]
  ) => this
  start: () => this
  close: () => void
}

type SubscriptionEventHandlers = {
  start: (type: 'start', txn: values.FaunaTime, event: values.FaunaTime) => void
  error: (
    type: 'error',
    txn: values.FaunaTime,
    event: {
      code: string
      description: string
    }
  ) => void
  version: (
    type: 'version',
    txn: values.FaunaTime,
    event: {
      action: 'create' | 'update' | 'delete'
      document: {
        ref: values.Ref
        ts: values.FaunaTime
        data: object
      }
      diff: {
        ref: values.Ref
        ts: values.FaunaTime
        data: object
      }
      prev: {
        ref: values.Ref
        ts: values.FaunaTime
        data?: object
      }
    }
  ) => void
  history_rewrite: (
    type: 'history_rewrite',
    txn: values.FaunaTime,
    event: {
      action: 'history_rewrite'
      document: {
        ref: values.Ref
        ts: values.FaunaTime
      }
    }
  ) => void
  snapshot: (
    type: 'snapshot',
    txn: values.FaunaTime,
    event: {
      action: 'snapshot'
      document: {
        ref: values.Ref
        ts: values.FaunaTime
        data: object
      }
    }
  ) => void
}
