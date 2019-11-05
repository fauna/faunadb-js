import Expr from './Expr'

export module values {
  export class Value extends Expr {
    toJSON(): object
    inspect(): string
  }

  export class Ref extends Value {
    constructor(id: string, col?: Ref, db?: Ref)

    id: string
    collection?: Ref
    class?: Ref
    database?: Ref
  }

  export class Native {
    static readonly COLLECTIONS: Ref
    static readonly INDEXES: Ref
    static readonly DATABASES: Ref
    static readonly KEYS: Ref
    static readonly FUNCTIONS: Ref
  }

  export class SetRef extends Value {
    constructor(value: string)
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

  export type Document<T = object> = {
    ref: Ref
    ts: number
    data: T
  }

  export type Page<T> = {
    data: T[]
    after?: Expr
    before?: Expr
  }
}
