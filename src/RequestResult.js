'use strict';

/**
 * A structure containing the request and response context for a given FaunaDB request. Provided to an observer
 * registered in the {@link Client} constructor.
 *
 * @param {Client} client
 *   The FaunaDB client used to execute the request.
 * @param {'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'} method
 *   The HTTP method used in the request.
 * @param {string} path
 *   The path that was queried. Relative to the client's domain.
 * @param {string} query
 *   URL query parameters. Only set if `method` is "GET".
 * @param {Object} requestContent
 *   The request data.
 * @param {string} responseRaw
 *   The unparsed response data, as a string.
 * @param {object} responseContent
 *   The response data parsed as JSON.
 * @param {number} statusCode
 *   The HTTP response status code.
 * @param {object} responseHeaders
 *   The HTTP headers returned in the response.
 * @param {number} startTime
 *   The time the request was issued by the client.
 * @param {number} endTime
 *   The time the response was received by the client.
 * @constructor
 */
function RequestResult(client, method, path, query, requestContent, responseRaw, responseContent, statusCode, responseHeaders, startTime, endTime) {
  /** @type {Client} */
  this.client = client;

  /** @type {'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'} */
  this.method = method;

  /** @type {string} */
  this.path = path;

  /**
   * URL query. Null unless `method == 'get'`.
   * *Not* related to {@link Client.query}.
   * @type {object}
   */
  this.query = query;

  /** @type {object} */
  this.requestContent = requestContent;

  /** @type {string} */
  this.responseRaw = responseRaw;

  /**
   * Parsed value returned by the server.
   * Includes "resource" wrapper dict, or may be an "errors" dict instead.
   * @type {object}
   */
  this.responseContent = responseContent;

  /** @type {number} */
  this.statusCode = statusCode;

  /** @type {object} */
  this.responseHeaders = responseHeaders;

  /** @type {number} */
  this.startTime = startTime;

  /** @type {number} */
  this.endTime = endTime;
}

/**
 * Returns the auth object configured in the client.
 * @type {{user: string, pass: string}}
 */
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
