/* global exports */
/* eslint-disable no-var */

var singleExports =
  ['model/Codec', 'model/Field', 'model/Model', 'AsyncStream', 'Client', 'PageStream']
singleExports.forEach(function(filename) {
  var module = require('./lib/' + filename).default
  exports[module.name] = module
})

var multipleExports = ['model/Builtin', 'errors', 'objects']
multipleExports.forEach(function(filename) {
  var module = require('./lib/' + filename)
  if ('default' in module) {
    exports[module.default.name] = module.default
    delete module.default
  }
  for (var key in module)
    exports[key] = module[key]
})

exports.query = require('./lib/query')
