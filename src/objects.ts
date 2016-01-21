import {InvalidQuery, InvalidValue} from './errors'
import {Query} from './query'

/**
FaunaDB ref.
See the [docs](https://faunadb.com/documentation/queries#values-special_types).

A simple wrapper around a string which can be extracted using `ref.value`.
Queries that require a Ref will not work if you just pass in a string.
*/
export class Ref {
  /** Raw string value. */
  value: string

  /**
  Create a Ref from a string, such as `new Ref('databases/prydain')`.
  Can also call `new Ref('databases', 'prydain')` or `new Ref(new Ref('databases'), 'prydain').
  */
  constructor(...parts: Array<Ref | string>) {
    this.value = parts.join('/')
  }

  /**
  Gets the class part out of the Ref.
  This is done by removing the id.
  So `new Ref('a', 'b/c').class` will be `new Ref('a/b')`.
  */
  get class(): Ref {
    const parts = this.value.split('/')
    if (parts.length === 1)
      return this
    else
      return new Ref(parts.slice(0, parts.length - 1).join('/'))
  }

  /**
  Removes the class part of the Ref, leaving only the id.
  this is everything after the last `/`.
  */
  get id(): string {
    const parts = this.value.split('/')
    if (parts.length === 1)
      throw new InvalidValue('The Ref does not have an id.')
    return parts[parts.length - 1]
  }

  /** @ignore */
  toJSON(): Object {
    return {'@ref': this.value}
  }

  /** @ignore */
  toString(): string {
    return this.value
  }

  /** @ignore */
  valueOf(): string {
    return this.value
  }

  /** @ignore */
  inspect(): string {
    return `Ref(${JSON.stringify(this.value)})`
  }

  /** Whether these are both Refs and have the same value. */
  equals(other: {}): boolean {
    return other instanceof Ref && this.value === other.value
  }
}

/**
FaunaDB Set.
This represents a set returned as part of a response.
This looks like This looks like `{"@set": set_query}`.
For query sets see [[match]], [[union]],
[[intersection]], [[difference]], and [[join]].
*/
export class SetRef {
  constructor(
    /** Raw query object. */
    public query: Query) {}

  /** @ignore */
  toJSON(): Object {
    return {'@set': this.query}
  }

  /** @ignore */
  inspect(): string {
    return `SetRef(${JSON.stringify(this.query)})`
  }
}

/**
FaunaDB Event.
See the [docs](https://faunadb.com/documentation/queries#values).
*/
export class Event {
  /**
  Events are not automatically converted.
  Use this on an object that you know represents an Event.
  */
  static fromRaw(object: any): Event {
    return new Event(object.ts, object.action, object.resource)
  }

  constructor(
    /** Microsecond UNIX timestamp at which the event occured. */
    public ts: number,
    /** 'create' or 'delete' */
    // TODO: typescript 1.8: type as `'create' | 'delete'`
    public action: string,
    /** The affected instance. */
    public resource: Ref) {
    if (!(action === 'create' || action === 'delete'))
      throw new InvalidQuery('Action must be create or delete.')
  }
}

/**
A single pagination result.
See `paginate` in the [docs](https://faunadb.com/documentation/queries#read_functions).
*/
export class Page<A> {
  /** Use this on an object that you know represents a Page. */
  static fromRaw<A>(object: {data: Array<A>, before: Ref, after: Ref}): Page<A> {
    return new Page(object.data, object.before, object.after)
  }

  constructor(
    /**
    Always a list.
    Elements could be raw data; some methods may convert data.
    */
    public data: Array<A>,
    /** Optional [[Ref]] for an instance that comes before this page. */
    public before: Ref,
    /** Optional [[Ref]] for an instance that comes after this page. */
    public after: Ref) {}

  /** Return a new Page whose data has had `func` applied to each element. */
  mapData<B>(func: (element: A) => B): Page<B> {
    return new Page(this.data.map(func), this.before, this.after)
  }
}

/** FaunaDB time. See the [docs](https://faunadb.com/documentation/queries#values-special_types). */
export class FaunaTime {
  /** ISO8601 time. */
  value: string

  /** @param value If a Date, this is converted to a string. */
  constructor(value: Date | string) {
    if (typeof value === 'string') {
      if (!value.endsWith('Z'))
        throw new InvalidValue(`Only allowed timezone is 'Z', got: ${value}`)
      this.value = value
    } else
      this.value = value.toISOString()
  }

  /** This is lossy as Dates have millisecond rather than nanosecond precision. */
  get date(): Date {
    return new Date(this.value)
  }

  /** @ignore */
  toJSON(): Object {
    return {'@ts': this.value}
  }
}

/** FaunaDB date. See the [docs](https://faunadb.com/documentation/queries#values-special_types). */
export class FaunaDate {
  /** ISO8601 date. */
  value: string

  /** @param value If a Date, this is converted to a string, with time-of-day discarded. */
  constructor(value: Date | string) {
    this.value = typeof value === 'string' ?
      value :
      // The first 10 characters 'YYYY-MM-DD' are the date portion.
      value.toISOString().slice(0, 10)
  }

  get date(): Date {
    return new Date(this.value)
  }

  /** @ignore */
  toJSON(): Object {
    return {'@date': this.value}
  }
}
