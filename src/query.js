'use strict';

var annotate = require('fn-annotate');
var Expr = require('./Expr');
var objectAssign = require('object-assign');

// Basic forms

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
function let_expr(vars, in_expr) {
  return new Expr({ let: Expr.wrapValues(vars), in: Expr.wrap(in_expr) });
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_form). */
function variable(varName) {
  return new Expr({ var: Expr.wrap(varName) });
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
function if_expr(condition, then, _else) {
  return new Expr({ if: Expr.wrap(condition), then: Expr.wrap(then), else: Expr.wrap(_else) });
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_form). */
function do_expr() {
  return new Expr({ do: Expr.wrap(varargs(arguments)) });
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */
function object(fields) {
  return new Expr({ object: Expr.wrapValues(fields) });
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
  var vars = annotate(func);
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
  return new Expr({ lambda: Expr.wrap(var_name), expr: Expr.wrap(expr) });
}

// Collection functions

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
function map(collection, lambda_expr) {
  return new Expr({ map: Expr.wrap(toLambda(lambda_expr)), collection: Expr.wrap(collection) });
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
function foreach(collection, lambda_expr) {
  return new Expr({ foreach: Expr.wrap(toLambda(lambda_expr)), collection: Expr.wrap(collection) });
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
function filter(collection, lambda_expr) {
  return new Expr({ filter: Expr.wrap(toLambda(lambda_expr)), collection: Expr.wrap(collection) });
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
function take(number, collection) {
  return new Expr({ take: Expr.wrap(number), collection: Expr.wrap(collection) });
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
function drop(number, collection) {
  return new Expr({ drop: Expr.wrap(number), collection: Expr.wrap(collection) });
}

function prepend(elements, collection) {
  return new Expr({ prepend: Expr.wrap(elements), collection: Expr.wrap(collection) });
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */
function append(elements, collection) {
  return new Expr({ append: Expr.wrap(elements), collection: Expr.wrap(collection) });
}

// Read functions

/** See the [docs](https://faunadb.com/documentation/queries#read_functions). */
function get(ref, ts) {
  ts = defaults(ts, null);

  return new Expr(params({ get: Expr.wrap(ref) }, { ts: Expr.wrap(ts) }));
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#read_functions).
 * You may want to convert the result of this to a {@link PageHelper}.
 */
function paginate(set, opts) {
  opts = defaults(opts, {});

  return new Expr(objectAssign({ paginate: Expr.wrap(set) }, Expr.wrapValues(opts)));
}

/** See the [docs](https://faunadb.com/documentation/queries#read_functions). */
function exists(ref, ts) {
  ts = defaults(ts, null);

  return new Expr(params({ exists: Expr.wrap(ref) }, { ts: Expr.wrap(ts) }));
}

/** See the [docs](https://faunadb.com/documentation/queries#read_functions). */
function count(set, events) {
  events = defaults(events, null);

  return new Expr(params({ count: Expr.wrap(set) }, { events: Expr.wrapValues(events) }));
}

// Write functions

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
function create(class_ref, params) {
  return new Expr({ create: Expr.wrap(class_ref), params: Expr.wrap(params) });
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
function update(ref, params) {
  return new Expr({ update: Expr.wrap(ref), params: Expr.wrap(params) });
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
function replace(ref, params) {
  return new Expr({ replace: Expr.wrap(ref), params: Expr.wrap(params) });
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
function delete_expr(ref) {
  return new Expr({ delete: Expr.wrap(ref) });
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
function insert(ref, ts, action, params) {
  return new Expr({ insert: Expr.wrap(ref), ts: Expr.wrap(ts), action: Expr.wrap(action), params: Expr.wrap(params) });
}

/** See the [docs](https://faunadb.com/documentation/queries#write_functions). */
function remove(ref, ts, action) {
  return new Expr({ remove: Expr.wrap(ref), ts: Expr.wrap(ts), action: Expr.wrap(action) });
}

// Sets

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
function match(index) {
  var args = argsToArray(arguments);
  args.shift();
  return new Expr({ match: Expr.wrap(index), terms: Expr.wrap(varargs(args)) });
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
function union() {
  return new Expr({ union: Expr.wrap(varargs(arguments)) });
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
function intersection() {
  return new Expr({ intersection: Expr.wrap(varargs(arguments)) });
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
function difference() {
  return new Expr({ difference: Expr.wrap(varargs(arguments)) });
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
function distinct(set) {
  return new Expr({ distinct: Expr.wrap(set) });
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */
function join(source, target) {
  return new Expr({ join: Expr.wrap(source), with: Expr.wrap(toLambda(target)) });
}

// Authentication

/** See the [docs](https://faunadb.com/documentation/queries#auth_functions). */
function login(ref, params) {
  return new Expr({ login: Expr.wrap(ref), params: Expr.wrap(params) });
}

/** See the [docs](https://faunadb.com/documentation/queries#auth_functions). */
function logout(delete_tokens) {
  return new Expr({ logout: Expr.wrap(delete_tokens) });
}

/** See the [docs](https://faunadb.com/documentation/queries#auth_functions). */
function identify(ref, password) {
  return new Expr({ identify: Expr.wrap(ref), password: Expr.wrap(password) });
}

// String functions

/** See the [docs](https://faunadb.com/documentation/queries#string_functions). */
function concat(strings, separator) {
  separator = defaults(separator, null);
  return new Expr(params({ concat: Expr.wrap(strings) }, { separator: Expr.wrap(separator) }));
}

/** See the [docs](https://faunadb.com/documentation/queries#string_functions). */
function casefold(string) {
  return new Expr({ casefold: Expr.wrap(string) });
}

// Time and date functions

/** See the [docs](https://faunadb.com/documentation/queries#time_functions). */
function time(string) {
  return new Expr({ time: Expr.wrap(string) });
}

/** See the [docs](https://faunadb.com/documentation/queries#time_functions). */
function epoch(number, unit) {
  return new Expr({ epoch: Expr.wrap(number), unit: Expr.wrap(unit) });
}

/** See the [docs](https://faunadb.com/documentation/queries#time_functions). */
function date(string) {
  return new Expr({ date: Expr.wrap(string) });
}

// Miscellaneous functions

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function next_id() {
  return new Expr({ next_id: null });
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function equals() {
  return new Expr({ equals: varargs(arguments) });
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function contains(path, _in) {
  return new Expr({ contains: Expr.wrap(path), in: Expr.wrap(_in) });
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function select(path, from) {
  return new Expr({ select: Expr.wrap(path), from: Expr.wrap(from) });
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function selectWithDefault(path, from, _default) {
  return new Expr({ select: Expr.wrap(path), from: Expr.wrap(from), default: Expr.wrapValues(_default) });
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function add() {
  return new Expr({ add: Expr.wrap(varargs(arguments)) });
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function multiply() {
  return new Expr({ multiply: Expr.wrap(varargs(arguments)) });
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function subtract() {
  return new Expr({ subtract: Expr.wrap(varargs(arguments)) });
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function divide() {
  return new Expr({ divide: Expr.wrap(varargs(arguments)) });
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function modulo() {
  return new Expr({ modulo: Expr.wrap(varargs(arguments)) });
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function lt() {
  return new Expr({ lt: Expr.wrap(varargs(arguments)) });
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function lte() {
  return new Expr({ lte: Expr.wrap(varargs(arguments)) });
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function gt() {
  return new Expr({ gt: Expr.wrap(varargs(arguments)) });
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function gte() {
  return new Expr({ gte: Expr.wrap(varargs(arguments)) });
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function and() {
  return new Expr({ and: Expr.wrap(varargs(arguments)) });
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function or() {
  return new Expr({ or: Expr.wrap(varargs(arguments)) });
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */
function not(boolean) {
  return new Expr({ not: Expr.wrap(boolean) });
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
  var valuesAsArr = Array.isArray(values) ? values : Array.prototype.slice.call(values);
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
  lambda: lambda,
  lambda_expr: lambda_expr,
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
  distinct: distinct,
  join: join,
  login: login,
  logout: logout,
  identify: identify,
  concat: concat,
  casefold: casefold,
  time: time,
  epoch: epoch,
  date: date,
  next_id: next_id,
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