import {Page} from './objects'
import * as query from './query'
import AsyncStream from './AsyncStream'
import {applyDefaults} from './_util'

/**
Used to iterate over the pages of a query.
Yields whole pages (Arrays) at a time.
See {@link PageStream.elements} to use stream over individual elements.
*/
export default class PageStream extends AsyncStream {
  /**
  Yields individual elements rather than whole pages at a time.
  Parameters are the same as the constructor.
  @return {AsyncStream}
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
    this._client = client
    this._set = set

    Object.assign(this, applyDefaults(opts, {
      // `undefined` automatically removed from queries by JSON.stringify.
      pageSize: undefined,
      mapLambda: null
    }))

    this._direction = undefined
    this._cursor = undefined
  }

  /** @override */
  async next() {
    if (this._cursor === 'done')
      return {done: true}

    let q = query.paginate(this._set, {size: this.pageSize, [this._direction]: this._cursor})
    if (this.mapLambda !== null)
      q = query.map(q, this.mapLambda)

    const page = Page.fromRaw(await this._client.query(q))

    if (this._direction === undefined)
      this._direction = page.after === undefined ? 'before' : 'after'
    this._cursor = page[this._direction]

    if (this._cursor === undefined)
      this._cursor = 'done'
    return {done: false, value: page.data}
  }
}
