import Client from './Client'
import { ExprArg } from './query'
import { FaunaTime, Ref } from './values'

export interface Subscription {
  on: (type: SubscriptionEvents, callback: Function) => this
  start: () => this
  close: () => this
  event: string
  txnTS: number
  data:
    | StreamStartEventData
    | StreamVersionEventData
    | StreamErrorEventData
    | StreamHistoryRewriteEventData
}

type StreamStartEventData = FaunaTime

type StreamVersionEventData = {
  ref: Ref
  ts: number
  action: string
  new: object
  old: object
  diff: string
}

type StreamErrorEventData = {
  code: number
  description: string
}

type StreamHistoryRewriteEventData = {
  ref: Ref
  ts: number
  action: string
}

type SubscriptionEvents = 'start' | 'version' | 'history_rewrite' | 'error'
