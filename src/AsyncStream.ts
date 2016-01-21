export type MaybePromise<A> = A | Promise<A>
export type FlatMapper<A, B> = (element: A) => MaybePromise<Iterable<B>>
export type Mapper<A, B> = (element: A) => MaybePromise<B>
export type Predicate<A> = (element: A) => MaybePromise<boolean>
export type NextResult<A> = {done: boolean, value?: A}

/**
Asynchronous iterator protocol. Asynchronously produces a stream of values on demand.
AsyncStreams are mutable objects, meaning they can only be used once.

Unlike a series of events, this doesn't produce the next value unless asked to,
making functions like [[AsyncStream#takeWhile]] possible.
*/
abstract class AsyncStream<A> {
  /**
  Creates an AsyncStream from any [iterable](
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterable).
  */
  static fromIterable<A>(iter: Iterable<A>): AsyncStream<A> {
    return new IteratorStream(iter[Symbol.iterator]())
  }

  /**
  This works like an async version of the [iterator protocol](
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterator).
  @abstract
  @return If `done`, `value` should be ignored.
  */
  async next(): Promise<NextResult<A>> {
    throw new Error('Not implemented.')
  }

  /** Perform an action for each value in the stream. */
  async each(doEach: (element: A) => MaybePromise<void>): Promise<void> {
    while (true) {
      const {value, done} = await this.next()
      if (done)
        break
      await doEach(value)
    }
  }

  /** Collect every value into an Array. */
  async all(): Promise<Array<A>> {
    const all: Array<A> = []
    await this.each((val: A) => {
      all.push(val)
    })
    return all
  }

  /** Lazily applies `mapFunc` to every value. */
  map<B>(mapFunc: Mapper<A, B>): AsyncStream<B> {
    return new MapStream(this, mapFunc)
  }

  /** Lazily removes elements not satisfying `predicate`. */
  filter(predicate: Predicate<A>): AsyncStream<A> {
    return new FilterStream(this, predicate)
  }

  /** Ends the stream at the first element not satisfying `predicate`. */
  takeWhile(predicate: Predicate<A>): AsyncStream<A> {
    return new TakeWhileStream(this, predicate)
  }

  /** Assuming that this stream's elements are iterable, concatenates of their contents. */
  flatten<B>(): AsyncStream<B> {
    return new FlattenStream(<any> this)
  }

  /** Applies 'flatMapFunc' to each element and concatenates the results. */
  flatMap<B>(flatMapFunc: FlatMapper<A, B>): AsyncStream<B> {
    return this.map(flatMapFunc).flatten()
  }
}
export default AsyncStream
// KLUDGE - fixed in typescript 1.8
exports.default = AsyncStream

class IteratorStream<A> extends AsyncStream<A> {
  constructor(private iterator: Iterator<A>) {
    super()
  }

  next(): Promise<NextResult<A>> {
    return Promise.resolve(this.iterator.next())
  }
}

class MapStream<A, B> extends AsyncStream<B> {
  constructor(private base: AsyncStream<A>, private mapFunc: Mapper<A, B>) {
    super()
  }

  async next(): Promise<NextResult<B>> {
    const {done, value} = await this.base.next()
    return done ? {done} : {done, value: await this.mapFunc(value)}
  }
}

class FilterStream<A> extends AsyncStream<A> {
  constructor(private base: AsyncStream<A>, private predicate: Predicate<A>) {
    super()
  }

  async next(): Promise<NextResult<A>> {
    while (true) {
      const {done, value} = await this.base.next()
      // TODO: want to write `done || await this.predicate(value)`
      // but typescript compiles that into unrunnable code
      if (done)
        return {done, value}
      if (await this.predicate(value))
        return {done, value}
    }
  }
}

class TakeWhileStream<A> extends AsyncStream<A> {
  constructor(private base: AsyncStream<A>, private predicate: Predicate<A>) {
    super()
  }

  async next(): Promise<NextResult<A>> {
    const {done, value} = await this.base.next()
    return (await this.predicate(value)) ? {done, value} : {done: true}
  }
}

class FlattenStream<A> extends AsyncStream<A> {
  private curIter: Iterator<A>

  constructor(private base: AsyncStream<Iterable<A>>) {
    super()
    this.curIter = {next(): NextResult<A> { return {done: true} }}
  }

  async next(): Promise<NextResult<A>> {
    const {done, value} = this.curIter.next()
    if (done) {
      const {done, value} = await this.base.next()
      if (done)
        return {done, value: null}
      this.curIter = value[Symbol.iterator]()
      return await this.next()
    } else
      return {done, value}
  }
}
