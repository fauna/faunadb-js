import Expr from './Expr'
import { JsonObject } from './json'

export module values {
  export class Value<T = any> extends Expr<T> {
    toJSON(): object
    inspect(): string

    readonly _isFaunaValue?: boolean
  }

  export class Ref<T extends JsonObject = any> extends Value<Ref<T>> {
    constructor(id: string, col?: CollectionRef<T>, db?: Ref)

    id: string
    collection?: CollectionRef<T>
    database?: Ref

    readonly _isFaunaRef?: boolean

    /** This enforces type nominality. */
    protected _ref: { data: T }
  }

  export class SetRef<T = any> extends Value {
    constructor(value: string)

    /** This enforces type nominality. */
    protected _ref: { type: 'Set'; data: T }
  }

  export class Native {
    static readonly COLLECTIONS: Ref
    static readonly INDEXES: Ref
    static readonly DATABASES: Ref
    static readonly KEYS: Ref
    static readonly FUNCTIONS: Ref
    static readonly ACCESS_PROVIDERS: Ref
  }

  export class FaunaTime extends Value {
    constructor(value: string)
    constructor(value: Date)

    date: Date
  }

  export class FaunaDate extends Value {
    constructor(value: string)
    constructor(value: Date)

    date: Date
  }

  export class Bytes extends Value {
    constructor(value: string)
    constructor(value: ArrayBuffer)
    constructor(value: Uint8Array)
  }

  export class Query extends Value {
    constructor(value: object)
  }
}

/** The materialized data of a page. */
export interface Page<T> {
  data: T[]
  after?: Expr
  before?: Expr
}

/** The materialized data of a collection. */
export interface Collection<
  T extends JsonObject,
  Meta extends JsonObject = any
> extends JsonObject {
  ref: CollectionRef<T, Meta>
  ts: number
  name: string
  data: Meta
  permissions?: JsonObject
  history_days: number | null
  ttl_days?: number
}

/** The materialized data of a document. */
export interface Document<T extends JsonObject> extends JsonObject {
  data: T
  ref: DocumentRef<T>
  ts: number
}

/** The materialized data of an index. */
export interface Index<T extends JsonObject, Meta extends JsonObject = any>
  extends JsonObject {
  ref: IndexRef<T, Meta>
  ts: number
  name: string
  data: Meta
  source: CollectionRef<any> | any[]
  partitions: number
  active: boolean
  serialized?: boolean
  unique?: boolean
  terms?: any[]
  values?: any[]
  permissions?: JsonObject
}

/** The materialized data of a function. */
export interface Function<Return, Meta extends JsonObject = any>
  extends JsonObject {
  ref: FunctionRef<Return, Meta>
  ts: number
  name: string
  data: Meta
  body: JsonObject
  role?: any
}

declare const Ref: typeof values.Ref

export type Ref<T extends JsonObject = any> = values.Ref<T>
export type SetRef<T = any> = values.SetRef<T>

/** The ref to a collection. */
export abstract class CollectionRef<
  T extends JsonObject,
  Meta extends JsonObject = any
> extends Ref<Collection<T, Meta>> {
  /** This enforces type nominality. */
  protected _ref: { type: 'Collection'; data: Collection<T, Meta> }
}

/** The ref to a document. */
export abstract class DocumentRef<T extends JsonObject> extends Ref<
  Document<T>
> {
  /** This enforces type nominality. */
  protected _ref: { type: 'Document'; data: Document<T> }
}

/** The ref to an index. */
export abstract class IndexRef<
  T extends JsonObject,
  Meta extends JsonObject = any
> extends Ref<Index<T, Meta>> {
  /** This enforces type nominality. */
  protected _ref: { type: 'Index'; data: Index<T, Meta> }
}

/** The ref to a function. */
export abstract class FunctionRef<
  Return,
  Meta extends JsonObject = any
> extends Ref<Function<Return, Meta>> {
  /** This enforces type nominality. */
  protected _ref: { type: 'Function'; data: Function<Return, Meta> }
}
