import { values } from './values'

export default Expr

export class Expr<T = any> {
  constructor(obj: object)

  readonly _isFaunaExpr?: boolean
  static toString(expr: Expr): string

  // This prevents structural type equality with empty objects.
  private _exprType: T
}

/** Materialize an `Expr` type into its result type. */
export type Materialize<T> = T extends Expr<infer U>
  ? U
  : T extends ReadonlyArray<infer U>
  ? (U[] extends T
      ? ReadonlyArray<Materialize<U>>
      : { [P in keyof T]: Materialize<T[P]> })
  : T

/** Add support for `Expr` types to any type. */
export type ExprVal<T = unknown> =
  | Expr<Exclude<T, Expr>>
  | (T extends Expr | Lambda
      ? T
      : T extends ReadonlyArray<infer U>
      ? (U[] extends T
          ? ReadonlyArray<ExprVal<U>>
          : { [P in keyof T]: ExprVal<T[P]> })
      : T extends object
      ? { [P in keyof T]: ExprVal<T[P]> }
      : T)

export type ToExpr<T> = T extends Expr ? T : Expr<T>

export type Lambda<In extends any[] = any[], Out = any> = (
  ...args: { [P in keyof In]: ToExpr<In[P]> }
) => Expr<Out>

export interface Collection<T extends object> {
  ref: Expr.CollectionRef<T>
  ts: number
  name: string
  data?: object
  permissions?: object
  history_days: number | null
  ttl_days?: number
}

export interface Document<T extends object> {
  data: T
  ref: Expr.DocumentRef<T>
  ts: number
}

export interface Page<T> {
  data: T[]
  before?: string
  after?: string
}

export interface Index<T extends object> {
  ref: Expr.IndexRef<T>
  ts: number
  name: string
  data?: object
  source: Expr.CollectionRef<any> | any[]
  partitions: number
  active: boolean
  serialized?: boolean
  unique?: boolean
  terms?: any[]
  values?: any[]
  permissions?: object
}

export interface Function<T extends object> {
  ref: Expr.FunctionRef<T>
  ts: number
  name: string
  body: object
  role?: any
  data?: object
}

export namespace Expr {
  export abstract class Ref<T extends object = any> extends Expr<values.Ref> {
    // This prevents structural type equality with empty objects.
    private _refType: T
  }

  /** @internal For type inference only. Please use `Expr.Iterable` instead. */
  export interface ArrayRef<T = any> extends Ref<T[]> {}

  /** Lazily evaluated set of refs */
  export interface SetRef<T extends object = any> extends ArrayRef<Ref<T>> {}

  export interface DocumentRef<T extends object> extends Ref<Document<T>> {}

  export interface CollectionRef<T extends object> extends Ref<Collection<T>> {}

  export interface IndexRef<T extends object> extends Ref<Index<T>> {}

  export interface FunctionRef<T> extends Ref<Function<T>> {}

  export interface Time extends Expr<values.FaunaTime> {}

  /** Expression types that can be passed to `q.Map`, `q.Filter`, etc */
  export type Iterable<T> = ExprVal<T[]> | ArrayRef<T> | Page<T>

  /** Expression type for the `path` argument of `q.Select` */
  export type KeyPath = ExprVal<(number | string)[]>

  /** Expression type for the `lambda` argument of `q.Filter` */
  export type Filter<T> = ExprVal<Lambda<[T], boolean>>
}
