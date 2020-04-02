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
  | ToExpr<T>
  | (T extends Expr | Lambda
      ? T
      : T extends ReadonlyArray<infer U>
      ? (U[] extends T
          ? ReadonlyArray<ExprVal<U>>
          : { [P in keyof T]: ExprVal<T[P]> })
      : T extends object
      ? { [P in keyof T]: ExprVal<T[P]> }
      : T)

export type ToExpr<T> = [T] extends [infer U]
  ? (T extends Expr ? T : Expr<Exclude<U, Expr>>)
  : never

export type Lambda<In extends any[] = any[], Out = any> = (
  ...args: { [P in keyof In]: ToExpr<In[P]> }
) => Expr<Out>

export interface Collection<T extends object, Meta extends object = any> {
  ref: Expr.CollectionRef<T, Meta>
  ts: number
  name: string
  data: Meta
  permissions?: object
  history_days: number | null
  ttl_days?: number
}

export interface Document<T extends object> {
  data: T
  ref: Expr.DocumentRef<T>
  ts: number
}

export interface Index<T extends object, Meta extends object = any> {
  ref: Expr.IndexRef<T, Meta>
  ts: number
  name: string
  data: Meta
  source: Expr.CollectionRef<any> | any[]
  partitions: number
  active: boolean
  serialized?: boolean
  unique?: boolean
  terms?: any[]
  values?: any[]
  permissions?: object
}

export interface Function<Return, Meta extends object = any> {
  ref: Expr.FunctionRef<Return, Meta>
  ts: number
  name: string
  data: Meta
  body: object
  role?: any
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

  export interface CollectionRef<T extends object, Meta extends object = any>
    extends Ref<Collection<T, Meta>> {}

  export interface IndexRef<T extends object, Meta extends object = any>
    extends Ref<Index<T, Meta>> {}

  export interface FunctionRef<Return, Meta extends object = any>
    extends Ref<Function<Return, Meta>> {}

  export interface Time extends Expr<values.FaunaTime> {}

  /** The expression type for a page from a paginated set returned by `q.Paginate` */
  export class Page<T = any> extends Expr<values.Page<T>> {
    // This prevents structural type equality.
    private _type: 'Page' & T
  }

  /** Expression types that can be passed to `q.Map`, `q.Filter`, etc */
  export type Iterable<T> = ExprVal<T[]> | ArrayRef<T> | Page<T>

  /** Expression type for the `path` argument of `q.Select` */
  export type KeyPath = ExprVal<(number | string)[]>

  /** Expression type for the `lambda` argument of `q.Filter` */
  export type Filter<T> = ExprVal<Lambda<[T], boolean>>

  /** The expression type that can be mapped with `q.Map` */
  export type Mappable<T = any> = Exclude<Iterable<T>, SetRef>

  /** The expression type returned by `q.Map` */
  export type MapResult<T extends Expr.Mappable, Out> = T extends Expr.Page
    ? Expr.Page<Out>
    : Expr<Out[]>
}
