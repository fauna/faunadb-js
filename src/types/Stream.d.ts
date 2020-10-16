import Client from './Client'
import { ExprArg } from './query'

export interface Subscription {
  on: (type: SubscriptionEvents, callback: Function) => this
  start: () => this
  close: () => this
}

type SubscriptionEvents = 'ref' | 'ts' | 'new' | 'old' | 'diff' | 'action'
