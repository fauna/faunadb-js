import Client from './Client'
import { ExprArg } from './query'
import { values } from './values'

export type StreamSubscription =
  | StreamStartSubscription
  | StreamVersionSubscription
  | StreamErrorSubscription
  | StreamHistoryRewriteSubscription

interface Subscription {
  start: () => this
  close: () => void
  txnTS: number
}

interface StreamStartSubscription extends Subscription {
  on: (type: 'start', callback: Function) => this
  event: 'start'
  data: values.FaunaTime
}

interface StreamVersionSubscription extends Subscription {
  on: (type: 'version', callback: Function) => this
  event: 'version'
  data: {
    ref: values.Ref
    ts: number
    action: string
    new: object
    old: object
    diff: object
  }
}

interface StreamErrorSubscription extends Subscription {
  on: (type: 'error', callback: Function) => this
  event: 'error'
  data: {
    code: string
    description: string
  }
}

interface StreamHistoryRewriteSubscription extends Subscription {
  on: (type: 'history_rewrite', callback: Function) => this
  event: 'history_rewrite'
  data: {
    ref: values.Ref
    ts: number
    action: string
  }
}
