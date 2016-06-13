/**
 * An ES6 compatible promise. This driver depends on the {@link https://github.com/stefanpenner/es6-promise|es6-promise polyfill}.
 * @external Promise
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise}
 */

module.exports = {
  Client: require('./src/Client'),
  clientLogger: require('./src/clientLogger'),
  errors: require('./src/errors'),
  Expr: require('./src/Expr'),
  objects: require('./src/objects'),
  PageHelper: require('./src/PageHelper'),
  query: require('./src/query'),
  RequestResult: require('./src/RequestResult')
};