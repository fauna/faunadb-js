import Client from './Client'
import { ExprArg } from './query'

export interface Subscription {
  client: StreamClient
  dispatcher: EventDispatcher
}

export interface EventDispatcher {
  allowedEvents: string[]
}

export interface StreamClient {
  client: Client
  expression: ExprArg
  options: Options
  onEvent: Function
}

export interface Options {
  ref: string
  ts: string
  new: string
  old: string
  diff: string
  action: string
}
