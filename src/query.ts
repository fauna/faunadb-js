import {inspect} from 'util'
import {InvalidQuery} from './errors'
import {Event} from './objects'

export type Query = Object
export type Var = {var: string}
export type Lambda = Query | ((variable: Var) => Query);

// Basic forms

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
export function let_expr(vars: {[varName: string]: Query}, inExpr: Query): Query {
  return {let: vars, in: inExpr}
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_form). */
export function variable(varName: string): Var {
  return {var: varName}
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
export function if_expr(condition: Query, then: Query, _else: Query): Query {
  return {if: condition, then, else: _else}
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_form). */
export function do_expr(...expressions: Array<Query>): Query {
  return {do: varargs(expressions)}
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
export function object(fields: Object): Query {
  return {object: fields}
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
export function quote(expr: Query): Query {
  return {quote: expr}
}

let lambdaAutoVarNumber = 0

/**
See the [docs](https://faunadb.com/documentation/queries#basic_forms).
This form generates the names of lambda parameters for you, and is called like:

    query.lambda(a 45 query.add(a, a))
    // Produces: {lambda: 'auto0', expr: {add: [{var: 'auto0'}, {var: 'auto0'}]}}

Query functions requiring lambdas can be pass raw functions without explicitly calling `lambda`.
For example: `query.map(collection, a => query.add(a, 1))`.

You can also use [[lambda_pattern]], or use [[lambda_expr]] directly.
*/
export function lambda(func: (variable: Var) => Query): Query {
  const varName = `auto${lambdaAutoVarNumber}`
  lambdaAutoVarNumber += 1

  // Make sure lambdaAutoVarNumber returns to its former value even if there are errors.
  try {
    return lambda_expr(varName, func(variable(varName)))
  } finally {
    lambdaAutoVarNumber -= 1
  }
}

/** If `value` is a function converts it to a query using [[lambda]]. */
function toLambda(value: Lambda): Query {
  return value instanceof Function ? lambda(value) : value
}

/**
See the [docs](https://faunadb.com/documentation/queries#basic_forms).
This form gathers variables from the pattern you provide and puts them in an object.
It is called like:

    q = query.map(
      query.lambda_pattern(['foo', '', 'bar'], ({foo, bar}) => [bar, foo]),
      [[1, 2, 3], [4, 5, 6]]))
    // Result of client.query(q) is: [[3, 1], [6, 4]].

@param pattern
  Tree of Arrays and objects. Leaves are the names of variables.
  If a leaf is the empty string `''`, it is ignored.
@param func
  Takes an object of variables taken from the leaves of `pattern`, and returns a query.
*/
export function lambda_pattern(pattern: any, func: (_: {[key: string]: Var}) => Query): Query {
  const vars: any = {}
  function collectVars(pat: any): void {
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
export function lambda_expr(var_name_or_pattern: any, expr: Query): Query {
  return {lambda: var_name_or_pattern, expr}
}

// Collection functions

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
export function map(collection: Query, lambda_expr: Lambda): Query {
  return {map: toLambda(lambda_expr), collection}
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
export function foreach(collection: Query, lambda_expr: Lambda): Query {
  return {foreach: toLambda(lambda_expr), collection}
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
export function filter(collection: Query, lambda_expr: Lambda): Query {
  return {filter: toLambda(lambda_expr), collection}
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
export function take(number: Query, collection: Query): Query {
  return {take: number, collection}
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
export function drop(number: Query, collection: Query): Query {
  return {drop: number, collection}
}

export function prepend(elements: Query, collection: Query): Query {
  return {prepend: elements, collection}
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
export function append(elements: Query, collection: Query): Query {
  return {append: elements, collection}
}

// Read functions

/** See the [docs](https://faunadb.com/documentation/queries#read_functions). */
export function get(ref: Query, ts: Query = null): Query {
  return params({get: ref}, {ts})
}

export type PaginateOptions = {
  size?: Query,
  ts?: Query,
  after?: Query,
  before?: Query,
  events?: Query,
  sources?: Query
}
/**
See the [docs](https://faunadb.com/documentation/queries#read_functions).
You may want to convert the result of this to a [[Page]].
*/
export function paginate(set: Query, opts: PaginateOptions = {}): Query {
  return Object.assign({paginate: set}, opts)
}

/** See the [docs](https://faunadb.com/documentation/queries#read_functions). */
export function exists(ref: Query, ts: Query = null): Query {
  return params({exists: ref}, {ts})
}

/** See the [docs](https://faunadb.com/documentation/queries#read_functions). */
export function count(set: Query, events: Query = null): Query {
  return params({count: set}, {events})
}

// Write functions

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
export function create(class_ref: Query, params: Query): Query {
  return {create: class_ref, params}
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
export function update(ref: Query, params: Query): Query {
  return {update: ref, params}
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
export function replace(ref: Query, params: Query): Query {
  return {replace: ref, params}
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
export function delete_expr(ref: Query): Query {
  return {delete: ref}
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
export function insert(ref: Query, ts: Query, action: Query, params: Query): Query {
  return {insert: ref, ts, action, params}
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
export function insertEvent(event: Event, params: Query): Query {
  return insert(event.resource, event.ts, event.action, params)
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
export function remove(ref: Query, ts: Query, action: Query): Query {
  return {remove: ref, ts, action}
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
export function removeEvent(event: Event): Query {
  return remove(event.resource, event.ts, event.action)
}

// Sets

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
export function match(index: Query, terms: Query): Query {
  return {match: index, terms}
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
export function union(...sets: Array<Query>): Query {
  return {union: varargs(sets)}
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
export function intersection(...sets: Array<Query>): Query {
  return {intersection: varargs(sets)}
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
export function difference(...sets: Array<Query>): Query {
  return {difference: varargs(sets)}
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
export function join(source: Query, target: Lambda): Query {
  return {join: source, with: toLambda(target)}
}

// Time and date functions

/** See the [docs](https://faunadb.com/documentation/queries#time_functions). */
export function time(string: Query): Query {
  return {time: string}
}

/** See the [docs](https://faunadb.com/documentation/queries#time_functions). */
export function epoch(number: Query, unit: Query): Query {
  return {epoch: number, unit}
}

/** See the [docs](https://faunadb.com/documentation/queries#time_functions). */
export function date(string: Query): Query {
  return {date: string}
}

// Miscellaneous functions

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function equals(...values: Array<Query>): Query {
  return {equals: varargs(values)}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function concat(strings: Array<string>, separator: string = null): Query {
  return params({concat: strings}, {separator})
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function contains(path: Query, _in: Query): Query {
  return {contains: path, in: _in}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function select(path: Query, from: Query): Query {
  return {select: path, from}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function selectWithDefault(path: Query, from: Query, _default: Query): Query {
  return {select: path, from: from, default: _default}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function add(...numbers: Array<Query>): Query {
  return {add: varargs(numbers)}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function multiply(...numbers: Array<Query>): Query {
  return {multiply: varargs(numbers)}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function subtract(...numbers: Array<Query>): Query {
  return {subtract: varargs(numbers)}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function divide(...numbers: Array<Query>): Query {
  return {divide: varargs(numbers)}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function modulo(...numbers: Array<Query>): Query {
  return {modulo: varargs(numbers)}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function and(...booleans: Array<Query>): Query {
  return {and: varargs(booleans)}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function or(...booleans: Array<Query>): Query {
  return {or: varargs(booleans)}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function not(boolean: Query): Query {
  return {not: boolean}
}

/** Adds optional parameters to the query. */
function params(mainParams: any, optionalParams: any): any {
  for (const key in optionalParams) {
    const val = optionalParams[key]
    if (val !== null)
      mainParams[key] = val
  }
  return mainParams
}

/**
Called on rest arguments.
This ensures that a single value passed is not put in an array, so
`query.add([1, 2])` will work as well as `query.add(1, 2)`.
*/
function varargs(values: Array<Query>): Query {
  return values.length === 1 ? values[0] : values
}
