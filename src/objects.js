import {InvalidQuery, InvalidValue} from './errors'

/**
 * FaunaDB ref.
 * See the [docs](https://faunadb.com/documentation/queries#values-special_types).
 *
 * A simple wrapper around a string which can be extracted using `ref.value`.
 * Queries that require a Ref will not work if you just pass in a string.
 */
export class Ref {
  /**
   * Create a Ref from a string, such as `new Ref('databases/prydain')`.
   * Can also call `new Ref('databases', 'prydain')` or `new Ref(new Ref('databases'), 'prydain').
   */
  constructor() {
    const parts = Array.prototype.slice.call(arguments)
    /** Raw string value. */
    this.value = parts.join('/')
  }

  /**
   * Gets the class part out of the Ref.
   * This is done by removing the id.
   * So `new Ref('a', 'b/c').class` will be `new Ref('a/b')`.
   */
  get class() {
    const parts = this.value.split('/')
    if (parts.length === 1)
      return this
    else
      return new Ref(parts.slice(0, parts.length - 1).join('/'))
  }

  /**
   * Removes the class part of the Ref, leaving only the id.
   * this is everything after the last `/`.
   */
  get id() {
    const parts = this.value.split('/')
    if (parts.length === 1)
      throw new InvalidValue('The Ref does not have an id.')
    return parts[parts.length - 1]
  }

  /** @ignore */
  toJSON() {
    return {'@ref': this.value}
  }

  /** @ignore */
  toString() {
    return this.value
  }

  /** @ignore */
  valueOf() {
    return this.value
  }
}

/**
 * FaunaDB Set.
 * This represents a set returned as part of a response.
 * This looks like This looks like `{"@set": set_query}`.
 * For query sets see {@link match}, {@link union},
 * {@link intersection}, {@link difference}, and {@link join}.
 */
export class FaunaSet {
  constructor(query) {
    /** Raw query object. */
    this.query = query
  }

  /** @ignore */
  toJSON() {
    return {'@set': this.query}
  }
}

/**
 * FaunaDB Event.
 * See the [docs](https://faunadb.com/documentation/queries#values).
 */
export class Event {
  /**
   * Events are not automatically converted.
   * Use this on an object that you know represents an Event.
   */
  static fromRaw(object) {
    return new Event(object.ts, object.action, object.resource)
  }

  constructor(ts, action, resource) {
    /** Microsecond UNIX timestamp at which the event occured. */
    this.ts = ts
    if (!allowed_event_actions.has(action))
      throw new InvalidQuery('Action must be create or delete or null.')
    if (action !== null)
      /** 'create' or 'delete' */
      this.action = action
    if (resource !== null)
      /** The {@link Ref} of the affected instance. */
      this.resource = resource
  }
}
const allowed_event_actions = new Set([null, 'create', 'delete'])

/**
 * A single pagination result.
 * See `paginate` in the [docs](https://faunadb.com/documentation/queries#read_functions).
 */
export class Page {
  static fromRaw(object) {
    return new Page(object.data, object.before, object.after)
  }

  constructor(data, before, after) {
    /**
     * Always a list.
     * Elements could be raw data; some methods may convert data.
     */
    this.data = data
    /** Optional {@link Ref} for an instance that comes before this page. */
    this.before = before
    /** Optional {@link Ref} for an instance that comes after this page. */
    this.after = after
  }

  /** Return a new Page whose data has had `func` applied to each element. */
  mapData(func) {
    return new Page(this.data.map(func), this.before, this.after)
  }

  // TODO: setIterator is async, so need a different way to do that...
}
