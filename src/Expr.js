'use strict'

/**
 * A representation of a FaunaDB Query Expression. Generally, you shouldn't need
 * to use this class directly; use the Query helpers defined in {@link module:query}.
 *
 * @param {Object} obj The object that represents a Query to be treated as an Expression.
 * @constructor
 */
function Expr(obj) {
  this.raw = obj
}

Expr.prototype.toJSON = function() {
  return this.raw
}

var varArgsFunctions = [
  'Do',
  'Call',
  'Union',
  'Intersection',
  'Difference',
  'Equals',
  'Add',
  'BitAnd',
  'BitOr',
  'BitXor',
  'Divide',
  'Max',
  'Min',
  'Modulo',
  'Multiply',
  'Subtract',
  'LT',
  'LTE',
  'GT',
  'GTE',
  'And',
  'Or',
]
var specialCases = {
  is_nonempty: 'is_non_empty',
  lt: 'LT',
  lte: 'LTE',
  gt: 'GT',
  gte: 'GTE',
}

var exprToString = function(expr, caller) {
  if (expr instanceof Expr) {
    if ('value' in expr) return expr.toString()

    expr = expr.raw
  }

  var type = typeof expr

  if (type === 'string') {
    return JSON.stringify(expr)
  }

  if (type === 'symbol' || type === 'number' || type === 'boolean') {
    return expr.toString()
  }

  if (type === 'undefined') {
    return 'undefined'
  }

  if (expr === null) {
    return 'null'
  }

  var printObject = function(obj) {
    return (
      '{' +
      Object.keys(obj)
        .map(function(k) {
          return k + ': ' + exprToString(obj[k])
        })
        .join(', ') +
      '}'
    )
  }

  var printArray = function(array, toStr) {
    return array
      .map(function(item) {
        return toStr(item)
      })
      .join(', ')
  }

  if (Array.isArray(expr)) {
    var array = printArray(expr, exprToString)

    return varArgsFunctions.indexOf(caller) != -1 ? array : '[' + array + ']'
  }

  if ('let' in expr && 'in' in expr) {
    var letExpr = ''

    if (Array.isArray(expr['let']))
      letExpr = '[' + printArray(expr['let'], printObject) + ']'
    else letExpr = printObject(expr['let'])

    return 'Let(' + letExpr + ', ' + exprToString(expr['in']) + ')'
  }

  if ('object' in expr) return printObject(expr['object'])

  var keys = Object.keys(expr)
  var fn = keys[0]

  if (fn in specialCases) fn = specialCases[fn]

  fn = fn
    .split('_')
    .map(function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    })
    .join('')

  var args = keys.map(function(k) {
    var v = expr[k]
    return exprToString(v, fn)
  })

  var shouldReverseArgs = ['filter', 'map', 'foreach'].some(function(fn) {
    return fn in expr
  })

  if (shouldReverseArgs) {
    args.reverse()
  }

  args = args.join(', ')

  return fn + '(' + args + ')'
}

Expr.toString = exprToString

module.exports = Expr
