import Client from './Client'

export interface Subscription {
  client: Client
  dispatcher: EventDispatcher
}

export interface EventDispatcher {
  allowedEvents: string[]
}
