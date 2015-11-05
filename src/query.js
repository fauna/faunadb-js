/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
export function let_expr(vars, in_expr) {
  return {let: vars, in: in_expr}
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_form). */
export function variable(varName) {
  return {var: varName}
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
export function if_expr(condition, true_expr, false_expr) {
  return {if: condition, then: true_expr, else: false_expr}
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_form). */
export function do_expr(...expressions) {
  return {do: varargs(expressions)}
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
export function object(object) {
  return {object}
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
export function quote(quote) {
  return {quote}
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
 * For example: `query.map(a => query.add(a, 1), collection)`.
 *
 * You can also use {@link lambda_expr} directly.
 *
 * @param {function} lambda_body Takes a variable and uses it to construct an expression.
 */
export function lambda(lambda_body) {
  const varName = `auto${lambdaAutoVarNumber}`
  lambdaAutoVarNumber += 1

  // Make sure lambdaAutoVarNumber returns to its former value even if there are errors.
  try {
    return lambda_expr(varName, lambda_body(variable(varName)))
  } finally {
    lambdaAutoVarNumber -= 1
  }
}

/** If `value` is a function converts it to a query using {@link lambda}. */
function toLambda(value) {
  return value instanceof Function ? lambda(value) : value
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
export function lambda_expr(var_name, expr) {
  return {lambda: var_name, expr}
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
export function map(lambda_expr, collection) {
  return {map: toLambda(lambda_expr), collection}
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
export function foreach(lambda_expr, collection) {
  return {foreach: toLambda(lambda_expr), collection}
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
export function match(match, index) {
  return {match, index}
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

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function equals(...values) {
  return {equals: varargs(values)}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function concat(...strings) {
  return {concat: varargs(strings)}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function contains(path, value) {
  return {contains: path, in: value}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function select(path, data) {
  return {select: path, from: data}
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
export function selectWithDefault(path, data, _default) {
  return {select: path, from: data, default: _default}
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
