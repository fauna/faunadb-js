'use strict';

/**
 * A representation of a FaunaDB Query Expression. Generally, you shouldn't need
 * to use this class directly; use the Query helpers defined in {@link module:query}.
 *
 * @param {Object} obj The object that represents a Query to be treated as an Expression.
 * @constructor
 */
function Expr(obj) {
  this.raw = obj;
}

Expr.prototype.toJSON = function() {
  return this.raw;
};

var varArgsFunctions = ['Do', 'Call', 'Union', 'Intersection', 'Difference', 'Equals',
                        'FindStr', 'FindStrRegex', 'Repeat', 'SubString', 'ReplaceStrRegex',
                        'Add', 'BitAnd', 'BitOr', 'BitXor',  'Divide', 'Max', 'Min',
                        'Modulo', 'Multiply', 'Round', 'Subtract', 'Trunc', 'Hypot', 'Pow',
                        'LT', 'LTE', 'GT', 'GTE', 'And', 'Or'];
var specialCases = {
  is_nonempty: 'is_non_empty',
  lt: 'LT',
  lte: 'LTE',
  gt: 'GT',
  gte: 'GTE'
};

var exprToString = function(expr, caller) {
  if (expr instanceof Expr)
    expr = expr.raw;

  if (typeof expr === 'string')
    return '"' + expr + '"';

  if (typeof expr === 'number')
    return expr.toString();

  if (Array.isArray(expr)) {
    var array = expr.map(function(item) { return exprToString(item); }).join(', ');

    return varArgsFunctions.indexOf(caller) != -1 ? array : '[' + array + ']';
  }

  var keys = Object.keys(expr);
  var fn = keys[0];

  if (fn === 'object')
    return '{' + Object.keys(expr.object).map(function(k) { return k + ': ' + exprToString(expr.object[k])}).join(', ') + '}';

  if (fn in specialCases)
    fn = specialCases[fn];

  fn = fn.split('_').map(function(str) { return str.charAt(0).toUpperCase() + str.slice(1); }).join('');

  var args = keys.map(function(k) {
    var v = expr[k];
    return exprToString(v, fn)
  }).join(', ');
  return fn + '(' + args + ')';
};

Expr.toString = exprToString;

module.exports = Expr;
