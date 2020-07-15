import { values } from './values'

export type Json =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray
  | values.Value

export interface JsonObject {
  [property: string]: Json
}

export interface JsonArray extends ReadonlyArray<Json> {}
