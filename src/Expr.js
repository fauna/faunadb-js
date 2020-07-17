'use strict'

var util = require('./_util')

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

Expr.prototype._isFaunaExpr = true

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

// FQL function names come across the wire as all lowercase letters
// (like the key of this object). Not all are properly snake-cased
// on the Core side, which causes improper capitalizations.
//
// JS Driver patch: https://faunadb.atlassian.net/browse/FE-540
// Core update: https://faunadb.atlassian.net/browse/ENG-2110

var specialCases = {
  containsstr: 'ContainsStr',
  containsstrregex: 'ContainsStrRegex',
  endswith: 'EndsWith',
  findstr: 'FindStr',
  findstrregex: 'FindStrRegex',
  gt: 'GT',
  gte: 'GTE',
  is_nonempty: 'is_non_empty',
  lowercase: 'LowerCase',
  lt: 'LT',
  lte: 'LTE',
  ltrim: 'LTrim',
  rtrim: 'RTrim',
  regexescape: 'RegexEscape',
  replacestr: 'ReplaceStr',
  replacestrregex: 'ReplaceStrRegex',
  startswith: 'StartsWith',
  substring: 'SubString',
  titlecase: 'TitleCase',
  uppercase: 'UpperCase',
}

/**
 *
 * @param {Expr} expression A FQL expression
 * @returns {Boolean} Returns true for valid expressions
 */
function isExpr(expression) {
  return (
    expression instanceof Expr ||
    util.checkInstanceHasProperty(expression, '_isFaunaExpr')
  )
}

/**
 *
 * @param {Object} obj An object to print
 * @returns {String} String representation of object
 */
function printObject(obj) {
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

/**
 *
 * @param {Array} arr An array to print
 * @param {Function} toStr Function used for stringification
 * @returns {String} String representation of array
 */
function printArray(arr, toStr) {
  return arr
    .map(function(item) {
      return toStr(item)
    })
    .join(', ')
}

/**
 *
 * @param {String} fn A snake-case FQL function name
 * @returns {String} The correpsonding camel-cased FQL function name
 */
function convertToCamelCase(fn) {
  // For FQL functions with special formatting concerns, we
  // use the specialCases object above to define their casing.
  if (fn in specialCases) fn = specialCases[fn]

  return fn
    .split('_')
    .map(function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    })
    .join('')
}

/**
 *
 * @param {String[]} keys An array of keys from an FQL query object
 * @returns {String} The function name we wish to invoke
 */
function getFunctionFromKeys(keys) {
  if (keys.includes('collection')) return 'collection'

  if (keys.includes('call')) return 'call'

  if (keys.includes('filter')) return 'filter'

  if (keys.includes('foreach')) return 'foreach'

  if (keys.includes('if')) return 'if'

  if (keys.includes('map')) return 'map'

  if (keys.includes('select')) return 'select'

  if (keys.includes('update')) return 'update'
}

/**
 *
 * @param {*} expr A FQL expression
 * @returns {Boolean} Indicates if arguments should be reversed
 */
function shouldReverseArgs(expr) {
  return ['filter', 'map', 'foreach'].some(function(fn) {
    return fn in expr
  })
}

var exprToString = function(expr, caller) {
  if (isExpr(expr)) {
    if ('value' in expr) return expr.toString()
    expr = expr.raw
  }

  // Return early to avoid extra work if null
  if (expr === null) {
    return 'null'
  }

  // Return stringified value if expression is not an Object or Array
  switch (typeof expr) {
    case 'string':
      return JSON.stringify(expr)
    case 'symbol':
    case 'number':
    case 'boolean':
      return expr.toString()
    case 'undefined':
      return 'undefined'
  }

  // Handle expression Arrays
  if (Array.isArray(expr)) {
    var array = printArray(expr, exprToString)
    return varArgsFunctions.indexOf(caller) != -1 ? array : '[' + array + ']'
  }

  // Parse expression Objects
  if ('match' in expr) {
    var matchStr = exprToString(expr['match'])
    var terms = expr['terms'] || []

    if (isExpr(terms)) terms = terms.raw

    if (Array.isArray(terms) && terms.length == 0)
      return 'Match(' + matchStr + ')'

    if (Array.isArray(terms)) {
      return (
        'Match(' + matchStr + ', [' + printArray(terms, exprToString) + '])'
      )
    }

    return 'Match(' + matchStr + ', ' + exprToString(terms) + ')'
  }

  if ('paginate' in expr) {
    var setStr = exprToString(expr['paginate'])

    var expr2 = Object.assign({}, expr)
    delete expr2['paginate']

    if (Object.keys(expr2).length == 0) return 'Paginate(' + setStr + ')'

    return 'Paginate(' + setStr + ', ' + printObject(expr2) + ')'
  }

  if ('let' in expr && 'in' in expr) {
    var letExpr = ''

    if (Array.isArray(expr['let']))
      letExpr = '[' + printArray(expr['let'], printObject) + ']'
    else letExpr = printObject(expr['let'])

    return 'Let(' + letExpr + ', ' + exprToString(expr['in']) + ')'
  }

  if ('object' in expr) return printObject(expr['object'])

  if ('filter' in expr) {
    return (
      'Filter(' +
      exprToString(expr['collection']) +
      ', ' +
      'Lambda(' +
      exprToString(expr['filter']['lambda']) +
      ', ' +
      exprToString(expr['filter']['expr']) +
      '))'
    )
  }

  if ('lambda' in expr) {
    return (
      'Lambda(' +
      exprToString(expr['lambda']) +
      ', ' +
      exprToString(expr['expr']) +
      ')'
    )
  }

  if ('select' in expr) {
    return (
      'Select(' +
      exprToString(expr['select']) +
      ', ' +
      exprToString(expr['from']) +
      ')'
    )
  }

  if ('foreach' in expr) {
    return (
      'Foreach(' +
      exprToString(expr['collection']) +
      ', ' +
      exprToString(expr['foreach']) +
      ')'
    )
  }

  // Versioned queries/lambdas will have an api_version field.
  // We want to prevent it from being parsed and displayed.
  var keys = Object.keys(expr).filter(
    expression => expression !== 'api_version'
  )

  var fn = keys[0]

  // Handle functions with an arity greater than 1
  if (keys.length > 1) {
    fn = getFunctionFromKeys(fn)
  }

  fn = convertToCamelCase(fn)

  var args = keys.map(function(k) {
    var v = expr[k]
    return exprToString(v, fn)
  })

  if (shouldReverseArgs(expr)) {
    args.reverse()
  }

  args = args.join(', ')

  return fn + '(' + args + ')'
}

Expr.toString = exprToString

module.exports = Expr
