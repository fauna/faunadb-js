import btoa from 'btoa-lite'
import request from 'superagent'
import {FaunaHTTPError} from './errors'
import {Ref} from './objects'
import {parseJSON} from './_json'
import RequestResult from './RequestResult'
import {toQuery} from './query'
import {applyDefaults, removeUndefinedValues} from './_util'

/**
 * Directly communicates with FaunaDB via JSON.
 *
 * It is encouraged to pass e.g. {@link Ref} objects instead of raw JSON data.
 *
 * All methods return a converted JSON response.
 * This is an object containing Arrays, strings, and other objects.
 * Any {@link Ref}, {@link SetRef}, {@link FaunaTime}, or {@link FaunaDate}
 * values in it will also be parsed.
 * (So instead of `{ "@ref": "classes/frogs/123" }`,
 * you will get `new Ref("classes/frogs/123")`.)
 *
 * There is no way to automatically convert to any other type, such as {@link Event},
 * from the response; you'll have to do that yourself manually.
 */
export default class Client {
  /**
   *
   * @param {string} options.domain Base URL for the FaunaDB server.
   * @param {('http'|'https')} options.scheme HTTP scheme to use.
   * @param {number} options.port Port of the FaunaDB server.
   * @param {?Object} options.secret
   *   Auth token for the FaunaDB server.
   *   Passed straight to [request](https://github.com/request/request#http-authentication).
   * @param {string} options.secret.user
   * @param {string} options.secret.pass
   * @param {?number} options.timeout Read timeout in seconds.
   * @param {function(res: RequestResult): void} options.observer
   *   Callback that will be called after every completed request.
   */
  constructor(options) {
    const opts = applyDefaults(options, {
      domain: 'rest.faunadb.com',
      scheme: 'https',
      port: null,
      secret: null,
      timeout: 60,
      observer: null
    })

    if (opts.port === null)
      opts.port = opts.scheme === 'https' ? 443 : 80

    this._baseUrl = `${opts.scheme}://${opts.domain}:${opts.port}`
    this._timeout = Math.floor(opts.timeout * 1000)
    this._secret = opts.secret
    this._observer = opts.observer
  }

  /**
   * HTTP `GET`.
   * See the [docs](https://faunadb.com/documentation/rest).
   * @param {string|Ref} path Path relative the `domain` from the constructor.
   * @param {Object} query URL parameters.
   * @return {Promise<Object>} Converted JSON response.
   */
  get(path, query=null) {
    return this._execute('GET', path, null, query)
  }

  /**
   * HTTP `POST`.
   * See the [docs](https://faunadb.com/documentation/rest).
   * @param {string|Ref} path Path relative to the `domain` from the constructor.
   * @param {Object} data Object to be converted to request JSON.
   * @return {Promise<Object>} Converted JSON response.
   */
  post(path, data) {
    return this._execute('POST', path, data)
  }

  /**
   * Like {@link post}, but a `PUT` request.
   * See the [docs](https://faunadb.com/documentation/rest).
   */
  put(path, data) {
    return this._execute('PUT', path, data)
  }

  /**
   * Like {@link post}, but a `PATCH` request.
   * See the [docs](https://faunadb.com/documentation/rest).
   */
  patch(path, data) {
    return this._execute('PATCH', path, data)
  }

  /**
   * Like {@link post}, but a `DELETE` request.
   * See the [docs](https://faunadb.com/documentation/rest).
   */
  delete(path) {
    return this._execute('DELETE', path)
  }

  /**
   * Use the FaunaDB query API.
   * See the [docs](https://faunadb.com/documentation/queries)
   * and the query functions in this documentation.
   * @param expression {object} A query.
   * @return {Promise<Object>} Server's response to the query.
   */
  query(expression) {
    return this._execute('POST', '', toQuery(expression))
  }

  /**
   * Ping FaunaDB.
   * See the [docs](https://faunadb.com/documentation/rest#other).
   * @return {Promise<string>}
   */
  ping(scope=undefined, timeout=undefined) {
    return this.get('ping', {scope, timeout})
  }

  async _execute(action, path, data, query=null) {
    if (path instanceof Ref)
      path = path.value
    if (query !== null)
      query = removeUndefinedValues(query)

    const startTime = Date.now()
    const response = await this._performRequest(action, path, data, query)
    const endTime = Date.now()
    const responseObject = parseJSON(response.text)
    const requestResult = new RequestResult(
      this,
      action, path, query, data,
      response.text, responseObject, response.status, response.header,
      startTime, endTime)

    if (this._observer != null)
      this._observer(requestResult)

    FaunaHTTPError.raiseForStatusCode(requestResult)
    return responseObject['resource']
  }

  _performRequest(action, path, data, query) {
    const rq = request(action, `${this._baseUrl}/${path}`)
    if (query)
      rq.query(query)
    if (data)
      rq.send(data)
    if (this._secret)
      rq.set('Authorization', secretHeader(this._secret))
    rq.timeout(this._timeout)

    return new Promise((resolve, reject) => {
      rq.end((error, result) => {
        // superagent treates 4xx and 5xx status codes as exceptions. We'll handle those ourselves.
        if (error && !('status' in error))
          reject(error)
        else
          resolve(result)
      })
    })
  }
}

function secretHeader(secret) {
  const str = 'pass' in secret ? `${secret.user}:${secret.pass}` : secret.user
  return `Basic ${btoa(str)}`
}
