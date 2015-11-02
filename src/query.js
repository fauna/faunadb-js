import {inspect} from 'util'
import {InvalidQuery} from './errors'

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
export function let_expr(vars, in_expr) {
  return {let: vars, in: in_expr}
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_form). */
export function variable(varName) {
  return {var: varName}
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
export function if_expr(condition, then, _else) {
  return {if: condition, then, else: _else}
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_form). */
export function do_expr(...expressions) {
  return {do: varargs(expressions)}
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
export function object(fields) {
  return {object: fields}
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
export function quote(expr) {
  return {quote: expr}
}

let lambdaAutoVarNumber = 0

/**
 * See the [docs](https://faunadb.com/documentation/queries#basic_forms).
 * This form generates the names of lambda parameters for you, and is called like:
 *
 *     query.lambda(a => query.add(a, a))
 *     // Produces: {lambda: 'auto0', expr: {add: [{var: 'auto0'}, {var: 'auto0'}]}}
 *
 * Query functions requiring lambdas can be pass raw functions without explicitly calling `lambda`.
 * For example: `query.map(collection, a => query.add(a, 1))`.
 *
 * You can also use {@link lambda_pattern}, or use {@link lambda_expr} directly.
 *
 * @param {function} func Takes a variable and uses it to construct an expression.
 * @return {lambda_expr}
 */
export function lambda(func) {
  const varName = `auto${lambdaAutoVarNumber}`
  lambdaAutoVarNumber += 1

  // Make sure lambdaAutoVarNumber returns to its former value even if there are errors.
  try {
    return lambda_expr(varName, func(variable(varName)))
  } finally {
    lambdaAutoVarNumber -= 1
  }
}

/** If `value` is a function converts it to a query using {@link lambda}. */
function toLambda(value) {
  return value instanceof Function ? lambda(value) : value
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#basic_forms).
 * This form gathers variables from the pattern you provide and puts them in an object.
 * It is called like:
 *
 *     q = query.map(
 *       query.lambda_pattern(['foo', '', 'bar'], ({foo, bar}) => [bar, foo]),
 *       [[1, 2, 3], [4, 5, 6]]))
 *     // Result of client.query(q) is: [[3, 1], [6, 4]].
 *
 * @param {Array|object} pattern
 *   Tree of Arrays and objects. Leaves are the names of variables.
 *   If a leaf is the empty string `''`, it is ignored.
 * @param {function} func
 *   Takes an object of variables taken from the leaves of `pattern`, and returns a query.
 * @return {lambda_expr}
 */
export function lambda_pattern(pattern, func) {
  const vars = {}
  function collectVars(pat) {
    if (pat instanceof Array)
      pat.forEach(collectVars)
    else if (typeof pat === 'object')
      for (const key in pat)
        collectVars(pat[key])
    else if (typeof pat === 'string') {
      if (pat !== '')
        vars[pat] = variable(pat)
    } else
      throw new InvalidQuery(`Pattern must be Array, object, or string; got ${inspect(pat)}.`)
  }
  collectVars(pattern)
  return lambda_expr(pattern, func(vars))
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
export function lambda_expr(var_name, expr) {
  return {lambda: var_name, expr}
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
export function map(collection, lambda_expr) {
  return {map: toLambda(lambda_expr), collection}
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
export function foreach(collection, lambda_expr) {
  return {foreach: toLambda(lambda_expr), collection}
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
export function filter(collection, lambda_expr) {
  return {filter: toLambda(lambda_expr), collection}
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
export function take(number, collection) {
  return {take: number, collection}
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
export function drop(number, collection) {
  return {drop: number, collection}
}

export function prepend(elements, collection) {
  return {prepend: elements, collection}
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
export function append(elements, collection) {
  return {append: elements, collection}
}

/** See the [docs](https://faunadb.com/documentation/queries#read_functions). */
export function get(ref, ts=null) {
  return params({get: ref}, {ts})
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#read_functions).
 * You may want to convert the result of this to a {@link Page}.
 */
export function paginate(set, opts={}) {
  return Object.assign({paginate: set}, opts)
}

/** See the [docs](https://faunadb.com/documentation/queries#read_functions). */
export function exists(ref, ts=null) {
  return params({exists: ref}, {ts})
}

/** See the [docs](https://faunadb.com/documentation/queries#read_functions). */
export function count(set, events=null) {
  return params({count: set}, {events})
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
export function create(class_ref, params) {
  return {create: class_ref, params}
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
export function update(ref, params) {
  return {update: ref, params}
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
export function replace(ref, params) {
  return {replace: ref, params}
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
export function delete_expr(ref) {
  return {delete: ref}
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
export function match(terms, index) {
  return {match: terms, index}
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
export function union(...sets) {
  return {union: varargs(sets)}
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
export function intersection(...sets) {
  return {intersection: varargs(sets)}
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
export function difference(...sets) {
  return {difference: varargs(sets)}
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
export function join(source, target) {
  return {join: source, with: toLambda(target)}
}

/** See the [docs](https://faunadb.com/documentation/queries#time_functions). */
export function time(string) {
  return {time: string}
}

/** See the [docs](https://faunadb.com/documentation/queries#time_functions). */
export function epoch(number, unit) {
  return {epoch: number, unit}
}

/** See the [docs](https://faunadb.com/documentation/queries#time_functions). */
export function date(string) {
  return {date: string}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function equals(...values) {
  return {equals: varargs(values)}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function concat(...strings) {
  return {concat: varargs(strings)}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function concatWithSeparator(separator, ...strings) {
  return {concat: varargs(strings), separator}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function contains(path, _in) {
  return {contains: path, in: _in}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function select(path, from) {
  return {select: path, from}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function selectWithDefault(path, from, _default) {
  return {select: path, from: from, default: _default}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function add(...numbers) {
  return {add: varargs(numbers)}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function multiply(...numbers) {
  return {multiply: varargs(numbers)}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function subtract(...numbers) {
  return {subtract: varargs(numbers)}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function divide(...numbers) {
  return {divide: varargs(numbers)}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function modulo(...numbers) {
  return {modulo: varargs(numbers)}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function and(...booleans) {
  return {and: varargs(booleans)}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function or(...booleans) {
  return {or: varargs(booleans)}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function not(boolean) {
  return {not: boolean}
}

/** Adds optional parameters to the query. */
function params(mainParams, optionalParams) {
  for (const key in optionalParams) {
    const val = optionalParams[key]
    if (val !== null)
      mainParams[key] = val
  }
  return mainParams
}

/**
 * Called on rest arguments.
 * This ensures that a single value passed is not put in an array, so
 * `query.add([1, 2])` will work as well as `query.add(1, 2)`.
 */
function varargs(values) {
  return values.length === 1 ? values[0] : values
}
