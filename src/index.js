var query = require('./query')
var util = require('./_util')

module.exports = util.mergeObjects(
  {
    Client: require('./Client'),
    Expr: require('./Expr'),
    PageHelper: require('./PageHelper'),
    RequestResult: require('./RequestResult'),

    clientLogger: require('./clientLogger'),
    errors: require('./errors'),
    values: require('./values'),
    query: query,
  },
  query
)
