//todo: copy docs from faunadb-python (and adjust so it works for js)
import getParameterNames from 'fn-annotate'

// Basic forms


/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
export function let_expr(vars, in_expr) {
  // vars is an object, but we don't want it converted to an object expression.
  const varsExpr = new Expr(convertValues(vars))
  return q({let: varsExpr, in: in_expr})
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_form). */
export function variable(varName) {
  return q({var: varName})
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
export function if_expr(condition, then, _else) {
  return q({if: condition, then, else: _else})
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_form). */
export function do_expr(...expressions) {
  return q({do: varargs(expressions)})
}

/**
See the [docs](https://faunadb.com/documentation/queries#basic_forms).
This form generates `var` objects for you, and is called like::

  query.lambda(a => query.add(a, a))
  // Produces: {lambda: 'a', expr: {add: [{var: a}, {var: a}]}}

You usually don't need to call this directly as queries in lambdas will be converted for you.
For example: `query.map(collection, a => query.add(a, 1))`.

You can also use {@link lambda_expr} directly.

@param {function} func
  Takes one or more {@link var} expressions and uses them to construct an expression.
  If this has more than one argument, the lambda destructures an array argument.
  (To destructure single-element arrays use {@link lambda_expr}.)
*/
export function lambda(func) {
  const vars = getParameterNames(func)
  switch (vars.length) {
    case 0:
      throw new Error('Function must take at least 1 argument.')
    case 1:
      return lambda_expr(vars[0], func(variable(vars[0])))
    default:
      return lambda_expr(vars, func(...vars.map(variable)))
  }
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
export function lambda_expr(var_name, expr) {
  return q({lambda: var_name, expr})
}

// Collection functions

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
export function map(collection, lambda_expr) {
  return q({map: lambda_expr, collection})
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
export function foreach(collection, lambda_expr) {
  return q({foreach: lambda_expr, collection})
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
export function filter(collection, lambda_expr) {
  return q({filter: lambda_expr, collection})
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
export function take(number, collection) {
  return q({take: number, collection})
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
export function drop(number, collection) {
  return q({drop: number, collection})
}

export function prepend(elements, collection) {
  return q({prepend: elements, collection})
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
export function append(elements, collection) {
  return q({append: elements, collection})
}

// Read functions

/** See the [docs](https://faunadb.com/documentation/queries#read_functions). */
export function get(ref, ts=null) {
  return params({get: ref}, {ts})
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#read_functions).
 * You may want to convert the result of this to a {@link Page}.
 */
export function paginate(set, opts={}) {
  return params({paginate: set}, opts)
}

/** See the [docs](https://faunadb.com/documentation/queries#read_functions). */
export function exists(ref, ts=null) {
  return params({exists: ref}, {ts})
}

/** See the [docs](https://faunadb.com/documentation/queries#read_functions). */
export function count(set, events=null) {
  return params({count: set}, {events})
}

// Write functions

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
export function create(class_ref, params) {
  return q({create: class_ref, params})
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
export function update(ref, params) {
  return q({update: ref, params})
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
export function replace(ref, params) {
  return q({replace: ref, params})
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
export function delete_expr(ref) {
  return q({delete: ref})
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
export function insert(ref, ts, action, params) {
  return q({insert: ref, ts, action, params})
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
export function remove(ref, ts, action) {
  return q({remove: ref, ts, action})
}

// Sets

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
export function match(index, ...terms) {
  return q({match: index, terms: varargs(terms)})
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
export function union(...sets) {
  return q({union: varargs(sets)})
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
export function intersection(...sets) {
  return q({intersection: varargs(sets)})
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
export function difference(...sets) {
  return q({difference: varargs(sets)})
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
export function join(source, target) {
  return q({join: source, with: target})
}

// Authentication

/** See the [docs](https://faunadb.com/documentation/queries#auth_functions). */
export function login(ref, params) {
  return q({login: ref, params})
}

/** See the [docs](https://faunadb.com/documentation/queries#auth_functions). */
export function logout(delete_tokens) {
  return q({logout: delete_tokens})
}

/** See the [docs](https://faunadb.com/documentation/queries#auth_functions). */
export function identify(ref, password) {
  return q({identify: ref, password})
}

// String functions

/** See the [docs](https://faunadb.com/documentation/queries#string_functions). */
export function concat(strings, separator = null) {
  return params({concat: strings}, {separator})
}

/** See the [docs](https://faunadb.com/documentation/queries#string_functions). */
export function casefold(string) {
  return q({casefold: string})
}

// Time and date functions

/** See the [docs](https://faunadb.com/documentation/queries#time_functions). */
export function time(string) {
  return q({time: string})
}

/** See the [docs](https://faunadb.com/documentation/queries#time_functions). */
export function epoch(number, unit) {
  return q({epoch: number, unit})
}

/** See the [docs](https://faunadb.com/documentation/queries#time_functions). */
export function date(string) {
  return q({date: string})
}

// Miscellaneous functions

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function equals(...values) {
  return q({equals: varargs(values)})
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function contains(path, _in) {
  return q({contains: path, in: _in})
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function select(path, from) {
  return q({select: path, from})
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function selectWithDefault(path, from, _default) {
  return q({select: path, from: from, default: _default})
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function add(...numbers) {
  return q({add: varargs(numbers)})
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function multiply(...numbers) {
  return q({multiply: varargs(numbers)})
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function subtract(...numbers) {
  return q({subtract: varargs(numbers)})
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function divide(...numbers) {
  return q({divide: varargs(numbers)})
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function modulo(...numbers) {
  return q({modulo: varargs(numbers)})
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function lt(...values) {
  return q({lt: varargs(values)})
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function lte(...values) {
  return q({lte: varargs(values)})
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function gt(...values) {
  return q({gt: varargs(values)})
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function gte(...values) {
  return q({gte: varargs(values)})
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function and(...booleans) {
  return q({and: varargs(booleans)})
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function or(...booleans) {
  return q({or: varargs(booleans)})
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function not(boolean) {
  return q({not: boolean})
}

// Helpers

/** @ignore */
export class Expr {
  constructor(value) {
    this.value = value
  }

  toString() {
    return this.inspect()
  }

  inspect() {
    return `Expr(${JSON.stringify(this.value)})`
  }
}

/** @ignore */
export function toQuery(value) {
  if (value instanceof Expr)
    return value.value
  else if (value instanceof Function)
    return lambda(value).value
  else if (value != null && Object.getPrototypeOf(value) === Object.prototype)
    // It's an object literal -- An Object but not any subtype of Object.
    return {object: convertValues(value)}
  else if (value instanceof Array)
    return value.map(toQuery)
  else
    return value
}

function q(object) {
  return new Expr(convertValues(object))
}

function convertValues(object) {
  const out = {}
  for (let key in object)
    out[key] = toQuery(object[key])
  return out
}

// Helpers

/** Adds optional parameters to the query. */
function params(mainParams, optionalParams) {
  for (const key in optionalParams) {
    const val = optionalParams[key]
    if (val !== null)
      mainParams[key] = val
  }
  return q(mainParams)
}

/**
 * Called on rest arguments.
 * This ensures that a single value passed is not put in an array, so
 * `query.add([1, 2])` will work as well as `query.add(1, 2)`.
 */
function varargs(values) {
  return values.length === 1 ? values[0] : values
}
