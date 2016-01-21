import Client from './Client'
import {Page, Ref} from './objects'
import {Query, Lambda} from './query'
import * as query from './query'
import AsyncStream from './AsyncStream'
import {applyDefaults} from './_util'

export type PageStreamOptions = {
  pageSize?: number
  mapLambda?: Lambda
}

/**
Used to iterate over the pages of a query.
Yields whole pages (Arrays) at a time.
See [[PageStream.elements]] to use stream over individual elements.
*/
export default class PageStream<A> extends AsyncStream<Array<A>> {
  /**
  Yields individual elements rather than whole pages at a time.
  Parameters are the same as the constructor.
  */
  static elements<A>(client: Client, set: Query, opts: PageStreamOptions = {}): AsyncStream<A> {
    return new PageStream(client, set, opts).flatten()
  }

  private direction: string
  /** undefined: just starting; Ref: continuing; null: done */
  private cursor: Ref

  private pageSize: number
  private mapLambda: Lambda

  /**
  @param set Set query made by [[match]] or similar.
  @param opts.pageSize Number of elements in each page.
  @param opts.mapLambda Mapping query applied to each element of each page.
  */
  constructor(private client: Client, private set: Query, opts: PageStreamOptions = {}) {
    super()
    this.client = client
    this.set = set
    Object.assign(this, applyDefaults(opts, {
      // `undefined` automatically removed from queries by JSON.stringify.
      pageSize: undefined,
      mapLambda: null
    }))
    this.direction = undefined
    this.cursor = undefined
  }

  /** @override */
  async next(): Promise<{done: boolean, value: Array<A>}> {
    if (this.cursor === null)
      return {done: true, value: null}

    let q = query.paginate(this.set, {size: this.pageSize, [this.direction]: this.cursor})
    if (this.mapLambda !== null)
      q = query.map(q, this.mapLambda)

    const page = Page.fromRaw<A>(await this.client.query(q))

    if (this.direction === undefined)
      this.direction = page.after === undefined ? 'before' : 'after'
    this.cursor = (<any> page)[this.direction]

    if (this.cursor === undefined)
      this.cursor = null
    return {done: false, value: page.data}
  }
}
// KLUDGE - fixed in typescript 1.8
exports.default = PageStream
