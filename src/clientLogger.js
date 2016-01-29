import {toJSON} from './_json'

/**
 * Function that can be the `observer` for a {@link Client}.
 * Will call `loggerFunction` on a string representation of each {@link RequestResult}.
 * @param {function(logged: string): void} loggerFunction
 * @return {function(res: RequestResult): void}
 * @example
 * const client = new Client({
 *   ... other options ...
 *   observer: logger(console.log)
 * })
 * await client.ping() // Logs the request and response.
 */
export function logger(loggerFunction) {
  return requestResult => {
    loggerFunction(showRequestResult(requestResult))
  }
}

/** Translates a {@link RequestResult} to a string suitable for logging. */
export function showRequestResult(requestResult) {
  const {query, method, path, auth, requestContent, responseHeaders, responseContent,
    statusCode, timeTaken} = requestResult

  let out = ''
  function log(str) {
    out = out + str
  }

  function indent(str) {
    const indentStr = '  '
    return str.split('\n').join('\n' + indentStr)
  }

  function showJSON(object) {
    return indent(toJSON(object, true))
  }

  log(`Fauna ${method} /${path}${queryString(query)}\n`)
  log(`  Credentials: ${auth == null ? 'null' : `${auth.user}:${auth.pass}`}\n`)
  if (requestContent != null)
    log(`  Request JSON: ${showJSON(requestContent)}\n`)
  log(`  Response headers: ${showJSON(responseHeaders)}\n`)
  log(`  Response JSON: ${showJSON(responseContent)}\n`)
  log(`  Response (${statusCode}): Network latency ${timeTaken}ms\n`)

  return out
}

function queryString(query) {
  if (query == null)
    return ''

  const keys = Object.keys(query)
  if (keys.length === 0)
    return ''

  const pairs = keys.map(key => `${key}=${query[key]}`)
  return `?${pairs.join('&')}`
}
