var annotate = require('fn-annotate');

// Basic forms

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
function let_expr(vars, in_expr) {
  return { let: vars, in: in_expr };
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_form). */
function variable(varName) {
  return { var: varName };
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
function if_expr(condition, then, _else) {
  return { if: condition, then: then, else: _else };
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_form). */
function do_expr() {
  return { do: varargs(arguments) };
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
function object(fields) {
  return { object: fields };
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
function quote(expr) {
  return { quote: expr };
}

/**
 See the [docs](https://faunadb.com/documentation/queries#basic_forms).
 This form generates `var` objects for you, and is called like::

 query.lambda(a => query.add(a, a))
 // Produces: {lambda: 'a', expr: {add: [{var: a}, {var: a}]}}

 Query functions require lambdas can be passed functions
 without explicitly calling `lambda`.
 For example: `query.map(collection, a => query.add(a, 1))`.

 You can also use {@link lambda_expr} directly.

 @param {function} func
 Takes one or more {@link var} expressions and uses them to construct an expression.
 If this has more than one argument, the lambda destructures an array argument.
 (To destructure single-element arrays use {@link lambda_expr}.)
 */
function lambda(func) {
  var vars = annotate.getParameterNames(func);
  switch (vars.length) {
    case 0:
      throw new Error('Function must take at least 1 argument.');
    case 1:
      return lambda_expr(vars[0], func(variable(vars[0])));
    default:
      return lambda_expr(vars, func.apply(null, vars.map(variable)));
  }
}

/** If `value` is a function converts it to a query using {@link lambda}. */
function toLambda(value) {
  return value instanceof Function ? lambda(value) : value;
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
function lambda_expr(var_name, expr) {
  return { lambda: var_name, expr: expr };
}

// Collection functions

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
function map(collection, lambda_expr) {
  return { map: toLambda(lambda_expr), collection: collection };
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
function foreach(collection, lambda_expr) {
  return { foreach: toLambda(lambda_expr), collection: collection };
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
function filter(collection, lambda_expr) {
  return { filter: toLambda(lambda_expr), collection: collection };
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
function take(number, collection) {
  return { take: number, collection: collection };
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
function drop(number, collection) {
  return { drop: number, collection: collection };
}

function prepend(elements, collection) {
  return { prepend: elements, collection: collection };
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
function append(elements, collection) {
  return { append: elements, collection: collection };
}

// Read functions

/** See the [docs](https://faunadb.com/documentation/queries#read_functions). */
function get(ref, ts) {
  ts = defaults(ts, null);

  return params({ get: ref }, { ts: ts });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#read_functions).
 * You may want to convert the result of this to a {@link Page}.
 */
function paginate(set, opts) {
  opts = defaults(opts, {});

  return Object.assign({ paginate: set }, opts);
}

/** See the [docs](https://faunadb.com/documentation/queries#read_functions). */
function exists(ref, ts) {
  ts = defaults(ts, null);

  return params({ exists: ref }, { ts: ts });
}

/** See the [docs](https://faunadb.com/documentation/queries#read_functions). */
function count(set, events) {
  events = defaults(events, null);

  return params({ count: set }, { events: events });
}

// Write functions

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
function create(class_ref, params) {
  return { create: class_ref, params: params };
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
function update(ref, params) {
  return { update: ref, params: params };
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
function replace(ref, params) {
  return { replace: ref, params: params };
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
function delete_expr(ref) {
  return { delete: ref };
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
function insert(ref, ts, action, params) {
  return { insert: ref, ts: ts, action: action, params: params };
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
function remove(ref, ts, action) {
  return { remove: ref, ts: ts, action: action };
}

// Sets

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
function match(index) {
  var args = argsToArray(arguments);
  args.shift();
  return { match: index, terms: varargs(args) };
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
function union() {
  return { union: varargs(arguments) };
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
function intersection() {
  return { intersection: varargs(arguments) };
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
function difference() {
  return { difference: varargs(arguments) };
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
function join(source, target) {
  return { join: source, with: toLambda(target) };
}

// Authentication

/** See the [docs](https://faunadb.com/documentation/queries#auth_functions). */
function login(ref, params) {
  return { login: ref, params: params };
}

/** See the [docs](https://faunadb.com/documentation/queries#auth_functions). */
function logout(delete_tokens) {
  return { logout: delete_tokens };
}

/** See the [docs](https://faunadb.com/documentation/queries#auth_functions). */
function identify(ref, password) {
  return { identify: ref, password: password };
}

// String functions

/** See the [docs](https://faunadb.com/documentation/queries#string_functions). */
function concat(strings, separator) {
  separator = defaults(separator, null);
  return params({ concat: strings }, { separator: separator });
}

/** See the [docs](https://faunadb.com/documentation/queries#string_functions). */
function casefold(string) {
  return { casefold: string };
}

// Time and date functions

/** See the [docs](https://faunadb.com/documentation/queries#time_functions). */
function time(string) {
  return { time: string };
}

/** See the [docs](https://faunadb.com/documentation/queries#time_functions). */
function epoch(number, unit) {
  return { epoch: number, unit: unit };
}

/** See the [docs](https://faunadb.com/documentation/queries#time_functions). */
function date(string) {
  return { date: string };
}

// Miscellaneous functions

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function equals() {
  return { equals: varargs(arguments) };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function contains(path, _in) {
  return { contains: path, in: _in };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function select(path, from) {
  return { select: path, from: from };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function selectWithDefault(path, from, _default) {
  return { select: path, from: from, default: _default };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function add() {
  return { add: varargs(arguments) };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function multiply() {
  return { multiply: varargs(arguments) };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function subtract() {
  return { subtract: varargs(arguments) };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function divide() {
  return { divide: varargs(arguments) };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function modulo() {
  return { modulo: varargs(arguments) };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function lt() {
  return { lt: varargs(arguments) };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function lte() {
  return { lte: varargs(arguments) };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function gt() {
  return { gt: varargs(arguments) };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function gte() {
  return { gte: varargs(arguments) };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function and() {
  return { and: varargs(arguments) };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function or() {
  return { or: varargs(arguments) };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function not(boolean) {
  return { not: boolean };
}

// Helpers

/** Adds optional parameters to the query. */
function params(mainParams, optionalParams) {
  for (var key in optionalParams) {
    var val = optionalParams[key];
    if (val !== null) {
      mainParams[key] = val;
    }
  }
  return mainParams;
}

/**
 * Called on rest arguments.
 * This ensures that a single value passed is not put in an array, so
 * `query.add([1, 2])` will work as well as `query.add(1, 2)`.
 */
function varargs(values) {
  var valuesAsArr = (typeof values === 'array') ? values : Array.prototype.slice.call(values);
  return values.length === 1 ? values[0] : valuesAsArr;
}

function argsToArray(args) {
  var rv = [];
  rv.push.apply(rv, args);
  return rv;
}

function defaults(param, def) {
  if (param === undefined) {
    return def;
  } else {
    return param;
  }
}

module.exports = {
  let_expr: let_expr,
  variable: variable,
  if_expr: if_expr,
  do_expr: do_expr,
  object: object,
  quote: quote,
  lambda: lambda,
  lambda_expr: toLambda,
  map: map,
  foreach: foreach,
  filter: filter,
  take: take,
  drop: drop,
  prepend: prepend,
  append: append,
  get: get,
  paginate: paginate,
  exists: exists,
  count: count,
  create: create,
  update: update,
  replace: replace,
  delete_expr: delete_expr,
  insert: insert,
  remove: remove,
  match: match,
  union: union,
  intersection: intersection,
  difference: difference,
  join: join,
  login: login,
  logout: logout,
  identify: identify,
  concat: concat,
  casefold: casefold,
  time: time,
  epoch: epoch,
  date: date,
  equals: equals,
  contains: contains,
  select: select,
  selectWithDefault: selectWithDefault,
  add: add,
  multiply: multiply,
  subtract: subtract,
  divide: divide,
  modulo: modulo,
  lt: lt,
  lte: lte,
  gt: gt,
  gte: gte,
  and: and,
  or: or,
  not: not
};