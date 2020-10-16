import Client from './Client'
import { ExprArg } from './query'

export interface Subscription {
  on: (type: string, callback: Function) => this
  start: () => this
  close: () => this
}
