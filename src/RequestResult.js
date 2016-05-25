function RequestResult(client, method, path, query, requestContent, responseRaw, responseContent, statusCode, responseHeaders, startTime, endTime) {
  /** @type {Client} */
  this.client = client;

  /** @type {'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'} */
  this.method = method;

  /**
   * Path that was queried. Relative to client's domain.
   * @type {string}
   */
  this.path = path;

  /**
   * URL query. Null unless `method == 'get'`.
   * *Not* related to {@link Client.query}.
   * @type {object}
   */
  this.query = query;

  /**
   * Request data.
   * @type {object}
   */
  this.requestContent = requestContent;

  /**
   * String value returned by the server.
   * @type {string}
   */
  this.responseRaw = responseRaw;

  /**
   * Parsed value returned by the server.
   * Includes "resource" wrapper dict, or may be an "errors" dict instead.
   * @type {object}
   */
  this.responseContent = responseContent;

  /**
   * HTTP status code.
   * @type {number}
   */
  this.statusCode = statusCode;

  /**
   * Response headers.
   * @type {object}
   */
  this.responseHeaders = responseHeaders;

  /**
   * Time the request started.
   * @type {Date}
   */
  this.startTime = startTime;

  /**
   * Time the response was received.
   * @type {Date}
   */
  this.endTime = endTime;
}

/** @type {{user: string, pass: string}} */
Object.defineProperty(RequestResult.prototype, 'auth', { get: function() {
  return this.client._secret;
} });

/**
 * `this.endTime - this.startTime`: Time taken in milliseconds.
 * @type {number}
 */
Object.defineProperty(RequestResult.prototype, 'timeTaken', { get: function() {
  return this.endTime - this.startTime;
} });

module.exports = RequestResult;
