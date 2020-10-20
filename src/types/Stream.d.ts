import Client from './Client'
import { ExprArg } from './query'
import { values } from './values'

export interface Subscription {
  on: (type: SubscriptionEvents, callback: Function) => this
  start: () => this
  close: () => void
  event: string
  txnTS: number
  data:
    | StreamStartEventData
    | StreamVersionEventData
    | StreamErrorEventData
    | StreamHistoryRewriteEventData
}

type StreamStartEventData = values.FaunaTime

type StreamVersionEventData = {
  ref: values.Ref
  ts: number
  action: string
  new: object
  old: object
  diff: object
}

type StreamErrorEventData = {
  code: string
  description: string
}

type StreamHistoryRewriteEventData = {
  ref: values.Ref
  ts: number
  action: string
}

type SubscriptionEvents = 'start' | 'version' | 'history_rewrite' | 'error'
