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
  start: (
    ts: values.FaunaTime,
    event: {
      event: 'start'
      txnTs: number
      data: values.FaunaTime
    }
  ) => void
  error: (
    ts: values.FaunaTime,
    event: {
      event: 'error'
      txnTs: number
      data: {
        code: string
        description: string
      }
    }
  ) => void
  version: (
    ts: values.FaunaTime,
    event: {
      event: 'version'
      txnTs: number
      data: {
        ref: values.Ref
        ts: values.FaunaTime
        action: string
        new: object
        old?: object
        diff?: object
      }
    }
  ) => void
  history_rewrite: (
    ts: values.FaunaTime,
    event: {
      event: 'history_rewrite'
      txnTs: number
      data: {
        ref: values.Ref
        ts: values.FaunaTime
        action: string
      }
    }
  ) => void
  snapshot: (
    ts: values.FaunaTime,
    event: {
      event: 'snapshot'
      txnTs: number
      // TODO Confirm this 'data' object is properly defined
      data: {
        ref: values.Ref
        ts: values.FaunaTime
      }
    }
  ) => void
}
