var http2 = require('http2')

function request({
  url,
  body,
  headers,
  timeout,
  onError,
  scheme = 'https',
} = {}) {
  var method = http2.constants.HTTP2_METHOD_POST
  var client = http2.connect(url)
  var buffer = Buffer.from(body)

  client.on('error', onError)

  var request = client.request(
    {
      ...headers,
      [http2.constants.HTTP2_HEADER_SCHEME]: scheme,
      [http2.constants.HTTP2_HEADER_METHOD]: method,
      [http2.constants.HTTP2_HEADER_PATH]: `/stream`,
      'Content-Length': buffer.length,
    },
    { endStream: false }
  )

  if (timeout) {
    request.setTimeout(timeout)
  }

  request.setEncoding('utf8')
  request.write(buffer)

  return request
}

module.exports = {
  request,
}
