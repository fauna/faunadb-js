/**
Asynchronous iterator protocol. Asynchronously produces a stream of values on demand.
AsyncStreams are mutable objects, meaning they can only be used once.

Unlike a series of events, this doesn't produce the next value unless asked to,
making functions like {@link AsyncStream#takeWhile} possible.
*/
export default class AsyncStream {
  /**
  Creates an AsyncStream from any [iterable](
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterable).
  */
  static fromIterable(iter) {
    return new IteratorStream(iter[Symbol.iterator]())
  }

  /**
  This works like an async version of the [iterator protocol](
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterator).
  @abstract
  @return {Promise<{value, done: boolean}>}
    If `done`, `value` should be ignored.
  */
  async next() {
    throw new Error('Not implemented.')
  }

  /**
  Perform an action for each value in the stream.
  @param {function(elem): void} doEach
  @return {Promise<void>}
  */
  async each(doEach) {
    for (;;) {
      const {value, done} = await this.next()
      if (done)
        break
      await doEach(value)
    }
  }

  /**
  Collect every value into an Array.
  @return {Promise<Array>}
  */
  async all() {
    const all = []
    await this.each(val => {
      all.push(val)
    })
    return all
  }

  /**
  Lazily applies `mapFunc` to every value.
  @param {function(elem)} mapFunc
  @return {AsyncStream}
  */
  map(mapFunc) {
    return new MapStream(this, mapFunc)
  }

  /**
  Lazily removes elements not satisfying `predicate`.
  @param {function(elem): boolean} predicate
  @return {AsyncStream}
  */
  filter(predicate) {
    return new FilterStream(this, predicate)
  }

  /**
  Ends the stream at the first element not satisfying `predicate`.
  @param {function(elem): boolean} predicate
  @return {AsyncStream}
  */
  takeWhile(predicate) {
    return new TakeWhileStream(this, predicate)
  }

  /**
  Assuming that this stream's elements are iterable, returns the concatenation of their contents.
  @return {AsyncStream}
  */
  flatten() {
    return new FlattenStream(this)
  }

  /**
  Applies 'flatMapFunc' to each element and concatenates the results.
  @param {function(elem): iterable} flatMapFunc
  @return {AsyncStream}
  */
  flatMap(flatMapFunc) {
    return this.map(flatMapFunc).flatten()
  }
}

class IteratorStream extends AsyncStream {
  constructor(iterator) {
    super()
    this.iterator = iterator
  }

  next() {
    return this.iterator.next()
  }
}

class MapStream extends AsyncStream {
  constructor(base, mapFunc) {
    super()
    this.base = base
    this.mapFunc = mapFunc
  }

  async next() {
    const {value, done} = await this.base.next()
    if (done)
      return {done}
    else
      return {value: await this.mapFunc(value), done}
  }
}

class FilterStream extends AsyncStream {
  constructor(base, predicate) {
    super()
    this.base = base
    this.predicate = predicate
  }

  async next() {
    for (;;) {
      const {value, done} = await this.base.next()
      if (done)
        return {done}
      if (await this.predicate(value))
        return {value, done}
    }
  }
}

class TakeWhileStream extends AsyncStream {
  constructor(base, predicate) {
    super()
    this.base = base
    this.predicate = predicate
  }

  async next() {
    const {value, done} = await this.base.next()
    if (done)
      return {done}
    if (!(await this.predicate(value)))
      return {done: true}
    return {value, done}
  }
}

class FlattenStream extends AsyncStream {
  constructor(base) {
    super()
    this.base = base
    this.curIter = {next() { return {done: true} }}
  }

  async next() {
    const {value, done} = this.curIter.next()
    if (done) {
      const {value, done} = await this.base.next()
      if (done)
        return {done}
      this.curIter = value[Symbol.iterator]()
      return await this.next()
    } else
      return {value, done}
  }
}
