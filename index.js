var query = require('./src/query')
var util = require('./src/_util')

module.exports = util.mergeObjects(
  {
    Client: require('./src/Client'),
    Expr: require('./src/Expr'),
    PageHelper: require('./src/PageHelper'),
    RequestResult: require('./src/RequestResult'),

    clientLogger: require('./src/clientLogger'),
    errors: require('./src/errors'),
    values: require('./src/values'),
    query: query,
  },
  query
)
