import {Page} from './objects'
import * as query from './query'
import AsyncStream from './AsyncStream'
import {applyDefaults} from './_util'

/** Used to iterate over the pages of a query. */
export default class PageStream extends AsyncStream {
  /**
  Yields individual elements rather than whole pages at a time.
  Parameters are the same as the constructor.
  */
  static elements(client, set, opts={}) {
    return new PageStream(client, set, opts).flatten()
  }

  /**
   * @param {Client} client
   * @param {Object} set Set query made by {@link match} or similar.
   * @param {number} opts.pageSize Number of elements in each page.
   * @param {lambda} opts.mapLambda Mapping query applied to each element of each page.
   */
  constructor(client, set, opts={}) {
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
  async next() {
    if (this.cursor === 'done')
      return {done: true}

    let q = query.paginate(this.set, {size: this.pageSize, [this.direction]: this.cursor})
    if (this.mapLambda !== null)
      q = query.map(this.mapLambda, q)

    const page = Page.fromRaw(await this.client.query(q))

    if (this.direction === undefined)
      this.direction = page.after === undefined ? 'before' : 'after'
    this.cursor = page[this.direction]

    if (this.cursor === undefined)
      this.cursor = 'done'
    return {done: false, value: page.data}
  }
}
