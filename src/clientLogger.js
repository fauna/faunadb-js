var json = require('./_json');

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
function logger(loggerFunction) {
  return function(requestResult) {
    return loggerFunction(showRequestResult(requestResult));
  };
}

/** Translates a {@link RequestResult} to a string suitable for logging. */
function showRequestResult(requestResult) {
  var query = requestResult.query,
    method = requestResult.method,
    path = requestResult.path,
    auth = requestResult.auth,
    requestContent = requestResult.requestContent,
    responseHeaders = requestResult.responseHeaders,
    responseContent = requestResult.responseContent,
    statusCode = requestResult.statusCode,
    timeTaken = requestResult.timeTaken;

  var out = '';

  function log(str) {
    out = out + str;
  }

  log('Fauna ' + method + ' /' + path + _queryString(query) + '\n');
  log('  Credentials: ' + (auth == null ? 'null' : (auth.user + ':' + auth.pass)) + '\n');
  if (requestContent != null) {
    log('  Request JSON: ' + _showJSON(requestContent) + '\n');
  }
  log('  Response headers: ' + _showJSON(responseHeaders) + '\n');
  log('  Response JSON: ' + _showJSON(responseContent) + '\n');
  log('  Response (' + statusCode + '): Network latency ' + timeTaken + 'ms\n');

  return out;
}


function _indent(str) {
  var indentStr = '  ';
  return str.split('\n').join('\n' + indentStr);
}

function _showJSON(object) {
  return _indent(json.toJSON(object, true));
}

function _queryString(query) {
  if (query == null) {
    return '';
  }

  var keys = Object.keys(query);
  if (keys.length === 0) {
    return '';
  }

  var pairs = keys.map(function(key) { return key + '=' + query[key]; });
  return '?' + pairs.join('&');
}

module.exports = {
  logger: logger,
  showRequestResult: showRequestResult
};