import Client from './Client'
import { ExprArg } from './query'

export interface Subscription {
  on: Function
  start: Function
  close: Function
}

export interface ClientStreamOptions {
  fields: string[]
}
