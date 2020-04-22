export type Json = string | number | boolean | null | JsonObject | JsonArray

export interface JsonObject {
  [property: string]: Json
}

export interface JsonArray extends ReadonlyArray<Json> {}
