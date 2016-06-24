'use strict';

var annotate = require('fn-annotate');
var Expr = require('./Expr');
var values = require('./values');
var objectAssign = require('object-assign');

/**
 * @module query
 */

/**
 * @typedef {(Expr|string|number|boolean|Object)} module:query~ExprTerm
 */

/**
 * @typedef {(module:query~ExprTerm|Array<module:query~ExprTerm>)} module:query~ExprArg
 */

// Type helpers

/**
 * Constructs a Ref value.
 *
 * @param {string} ref
 * @return {Expr}
 */
function Ref() {
  var args = argsToArray(arguments);
  return new (values.Ref.bind.apply(values.Ref, [null].concat(args)));
}

// Basic forms

/**
 * See the [docs](https://faunadb.com/documentation/queries#basic_forms).
 *
 * @param {module:query~ExprArg} vars
 * @param {module:query~ExprArg} in_expr
 * @return {Expr}
 * */
function Let(vars, in_expr) {
  return new Expr({ let: Expr.wrapValues(vars), in: Expr.wrap(in_expr) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#basic_forms).
 *
 * @param {module:query~ExprArg} varName
 * @return {Expr}
 * */
function Var(varName) {
  return new Expr({ var: Expr.wrap(varName) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#basic_forms).
 *
 * @param {module:query~ExprArg} condition
 * @param {module:query~ExprArg} then
 * @param {module:query~ExprArg} _else
 * @return {Expr}
 * */
function If(condition, then, _else) {
  return new Expr({ if: Expr.wrap(condition), then: Expr.wrap(then), else: Expr.wrap(_else) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#basic_form).
 *
 * @param {...module:query~ExprArg} args
 * @return {Expr}
 * */
function Do() {
  return new Expr({ do: Expr.wrap(varargs(arguments)) });
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms).
 *
 * @param {...module:query~ExprArg} fields
 * @return {Expr}
 * */
function Object(fields) {
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
 @return {Expr}
 */
function Lambda(func) {
  var vars = annotate(func);
  switch (vars.length) {
    case 0:
      throw new Error('Function must take at least 1 argument.');
    case 1:
      return LambdaExpr(vars[0], func(Var(vars[0])));
    default:
      return LambdaExpr(vars, func.apply(null, vars.map(Var)));
  }
}

/** If `value` is a function converts it to a query using {@link lambda}.
 * @private
 * */
function toLambda(value) {
  return value instanceof Function ? Lambda(value) : value;
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms).
 *
 * @param {module:query~ExprArg} var_name
 * @param {module:query~ExprArg} expr
 * @return {Expr}
 * */
function LambdaExpr(var_name, expr) {
  return new Expr({ lambda: Expr.wrap(var_name), expr: Expr.wrap(expr) });
}

// Collection functions

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions).
 *
 * @param {module:query~ExprArg} collection
 * @param {module:query~ExprArg} lambda_expr
 * @return {Expr}
 * */
function Map(collection, lambda_expr) {
  return new Expr({ map: Expr.wrap(toLambda(lambda_expr)), collection: Expr.wrap(collection) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#collection_functions).
 *
 * @param {module:query~ExprArg} collection
 * @param {module:query~ExprArg} lambda_expr
 * @return {Expr}
 * */
function Foreach(collection, lambda_expr) {
  return new Expr({ foreach: Expr.wrap(toLambda(lambda_expr)), collection: Expr.wrap(collection) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#collection_functions).
 *
 * @param {module:query~ExprArg} collection
 * @param {module:query~ExprArg} lambda_expr
 * @return {Expr}
 * */
function Filter(collection, lambda_expr) {
  return new Expr({ filter: Expr.wrap(toLambda(lambda_expr)), collection: Expr.wrap(collection) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#collection_functions).
 *
 * @param {module:query~ExprArg} number
 * @param {module:query~ExprArg} collection
 * @return {Expr}
 * */
function Take(number, collection) {
  return new Expr({ take: Expr.wrap(number), collection: Expr.wrap(collection) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#collection_functions).
 *
 * @param {module:query~ExprArg} number
 * @param {module:query~ExprArg} collection
 * @return {Expr}
 * */
function Drop(number, collection) {
  return new Expr({ drop: Expr.wrap(number), collection: Expr.wrap(collection) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#collection_functions).
 *
 * @param {module:query~ExprArg} elements
 * @param {module:query~ExprArg} collection
 * @return {Expr}
 */
function Prepend(elements, collection) {
  return new Expr({ prepend: Expr.wrap(elements), collection: Expr.wrap(collection) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#collection_functions).
 *
 * @param {module:query~ExprArg} elements
 * @param {module:query~ExprArg} collection
 * @return {Expr}
 */
function Append(elements, collection) {
  return new Expr({ append: Expr.wrap(elements), collection: Expr.wrap(collection) });
}

// Read functions

/**
 * See the [docs](https://faunadb.com/documentation/queries#read_functions).
 *
 * @param {module:query~ExprArg} ref
 * @param {?module:query~ExprArg} ts
 * @return {Expr}
 */
function Get(ref, ts) {
  ts = defaults(ts, null);

  return new Expr(params({ get: Expr.wrap(ref) }, { ts: Expr.wrap(ts) }));
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#read_functions).
 * You may want to utilize {@link Client#paginate} to obtain a {@link PageHelper},
 * rather than using this query function directly.
 *
 * @param {module:query~ExprArg} set
 * @param {?Object} opts
 * @return {Expr}
 */
function Paginate(set, opts) {
  opts = defaults(opts, {});

  return new Expr(objectAssign({ paginate: Expr.wrap(set) }, Expr.wrapValues(opts)));
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#read_functions).
 *
 * @param {module:query~ExprArg} ref
 * @param {?module:query~ExprArg} ts
 * @return {Expr}
 */
function Exists(ref, ts) {
  ts = defaults(ts, null);

  return new Expr(params({ exists: Expr.wrap(ref) }, { ts: Expr.wrap(ts) }));
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#read_functions).
 *
 * @param {module:query~ExprArg} set
 * @param {?module:query~ExprArg} events
 * @return {Expr}
 */
function Count(set, events) {
  events = defaults(events, null);

  return new Expr(params({ count: Expr.wrap(set) }, { events: Expr.wrapValues(events) }));
}

// Write functions

/**
 * See the [docs](https://faunadb.com/documentation/queries#write_functions).
 *
 * @param {module:query~ExprArg} class_ref
 * @param {?module:query~ExprArg} params
 * @return {Expr}
 */
function Create(class_ref, params) {
  return new Expr({ create: Expr.wrap(class_ref), params: Expr.wrap(params) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#write_functions).
 *
 * @param {module:query~ExprArg} ref
 * @param {module:query~ExprArg} params
 * @return {Expr}
 */
function Update(ref, params) {
  return new Expr({ update: Expr.wrap(ref), params: Expr.wrap(params) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#write_functions).
 *
 * @param {module:query~ExprArg} ref
 * @param {module:query~ExprArg} params
 * @return {Expr}
 */
function Replace(ref, params) {
  return new Expr({ replace: Expr.wrap(ref), params: Expr.wrap(params) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#write_functions).
 *
 * @param {module:query~ExprArg} ref
 * @return {Expr}
 */
function Delete(ref) {
  return new Expr({ delete: Expr.wrap(ref) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#write_functions).
 *
 * @param {module:query~ExprArg} ref
 * @param {module:query~ExprArg} ts
 * @param {module:query~ExprArg} action
 * @param {module:query~ExprArg} params
 * @return {Expr}
 */
function Insert(ref, ts, action, params) {
  return new Expr({ insert: Expr.wrap(ref), ts: Expr.wrap(ts), action: Expr.wrap(action), params: Expr.wrap(params) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#write_functions).
 *
 * @param {module:query~ExprArg} ref
 * @param {module:query~ExprArg} ts
 * @param {module:query~ExprArg} action
 * @return {Expr}
 */
function Remove(ref, ts, action) {
  return new Expr({ remove: Expr.wrap(ref), ts: Expr.wrap(ts), action: Expr.wrap(action) });
}

// Sets

/**
 * See the [docs](https://faunadb.com/documentation/queries#sets).
 *
 * @param {module:query~ExprArg} index
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function Match(index) {
  var args = argsToArray(arguments);
  args.shift();
  return new Expr({ match: Expr.wrap(index), terms: Expr.wrap(varargs(args)) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#sets).
 *
 * @param {...module:query~ExprArg} sets
 * @return {Expr}
 */
function Union() {
  return new Expr({ union: Expr.wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#sets).
 *
 * @param {...module:query~ExprArg} sets
 * @return {Expr}
 * */
function Intersection() {
  return new Expr({ intersection: Expr.wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#sets).
 *
 * @param {...module:query~ExprArg} sets
 * @return {Expr}
 * */
function Difference() {
  return new Expr({ difference: Expr.wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#sets).
 *
 * @param {module:query~ExprArg} set
 * @return {Expr}
 * */
function Distinct(set) {
  return new Expr({ distinct: Expr.wrap(set) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#sets).
 *
 * @param {module:query~ExprArg} source
 * @param {module:query~ExprArg} target
 * @return {Expr}
 */
function Join(source, target) {
  return new Expr({ join: Expr.wrap(source), with: Expr.wrap(toLambda(target)) });
}

// Authentication

/**
 * See the [docs](https://faunadb.com/documentation/queries#auth_functions).
 *
 * @param {module:query~ExprArg} ref
 * @param {module:query~ExprArg} params
 * @return {Expr}
 * */
function Login(ref, params) {
  return new Expr({ login: Expr.wrap(ref), params: Expr.wrap(params) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#auth_functions).
 *
 * @param {module:query~ExprArg} delete_tokens
 * @return {Expr}
 */
function Logout(delete_tokens) {
  return new Expr({ logout: Expr.wrap(delete_tokens) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#auth_functions).
 *
 * @param {module:query~ExprArg} ref
 * @param {module:query~ExprArg} password
 * @return {Expr}
 */
function Identify(ref, password) {
  return new Expr({ identify: Expr.wrap(ref), password: Expr.wrap(password) });
}

// String functions

/**
 * See the [docs](https://faunadb.com/documentation/queries#string_functions).
 *
 * @param {module:query~ExprArg} strings
 * @param {?module:query~ExprArg} separator
 * @return {Expr}
 */
function Concat(strings, separator) {
  separator = defaults(separator, null);
  return new Expr(params({ concat: Expr.wrap(strings) }, { separator: Expr.wrap(separator) }));
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#string_functions).
 *
 * @param {module:query~ExprArg} string
 * @return {Expr}
 */
function Casefold(string) {
  return new Expr({ casefold: Expr.wrap(string) });
}

// Time and date functions
/**
 * See the [docs](https://faunadb.com/documentation/queries#time_functions).
 *
 * @param {module:query~ExprArg} string
 * @return {Expr}
 */
function Time(string) {
  return new Expr({ time: Expr.wrap(string) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#time_functions).
 *
 * @param {module:query~ExprArg} number
 * @param {module:query~ExprArg} unit
 * @return {Expr}
 */
function Epoch(number, unit) {
  return new Expr({ epoch: Expr.wrap(number), unit: Expr.wrap(unit) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#time_functions).
 *
 * @param {module:query~ExprArg} string
 * @return {Expr}
 */
function Date(string) {
  return new Expr({ date: Expr.wrap(string) });
}

// Miscellaneous functions

/**
 * See the [docs](https://faunadb.com/documentation/queries#misc_functions).
 *
 * @return {Expr}
 */
function NextId() {
  return new Expr({ next_id: null });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function Equals() {
  return new Expr({ equals: varargs(arguments) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#misc_functions).
 *
 * @param {module:query~ExprArg} path
 * @param {module:query~ExprArg} _in
 * @return {Expr}
 */
function Contains(path, _in) {
  return new Expr({ contains: Expr.wrap(path), in: Expr.wrap(_in) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#misc_functions).
 *
 * @param {module:query~ExprArg} path
 * @param {module:query~ExprArg} from
 * @param {?module:query~ExprArg} _default
 * @return {Expr}
 */
function Select(path, from, _default) {
  var exprObj = { select: Expr.wrap(path), from: Expr.wrap(from) };
  if (_default !== undefined) {
    exprObj.default = Expr.wrapValues(_default);
  }
  return new Expr(exprObj);
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function Add() {
  return new Expr({ add: Expr.wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function Multiply() {
  return new Expr({ multiply: Expr.wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function Subtract() {
  return new Expr({ subtract: Expr.wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function Divide() {
  return new Expr({ divide: Expr.wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function Modulo() {
  return new Expr({ modulo: Expr.wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function LT() {
  return new Expr({ lt: Expr.wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function LTE() {
  return new Expr({ lte: Expr.wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function GT() {
  return new Expr({ gt: Expr.wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function GTE() {
  return new Expr({ gte: Expr.wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function And() {
  return new Expr({ and: Expr.wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function Or() {
  return new Expr({ or: Expr.wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#misc_functions).
 *
 * @param {module:query~ExprArg} boolean
 * @return {Expr}
 */
function Not(boolean) {
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
  Ref: Ref,
  Let: Let,
  Var: Var,
  If: If,
  Do: Do,
  Object: Object,
  Lambda: Lambda,
  LambdaExpr: LambdaExpr,
  Map: Map,
  Foreach: Foreach,
  Filter: Filter,
  Take: Take,
  Drop: Drop,
  Prepend: Prepend,
  Append: Append,
  Get: Get,
  Paginate: Paginate,
  Exists: Exists,
  Count: Count,
  Create: Create,
  Update: Update,
  Replace: Replace,
  Delete: Delete,
  Insert: Insert,
  Remove: Remove,
  Match: Match,
  Union: Union,
  Intersection: Intersection,
  Difference: Difference,
  Distinct: Distinct,
  Join: Join,
  Login: Login,
  Logout: Logout,
  Identify: Identify,
  Concat: Concat,
  Casefold: Casefold,
  Time: Time,
  Epoch: Epoch,
  Date: Date,
  NextId: NextId,
  Equals: Equals,
  Contains: Contains,
  Select: Select,
  Add: Add,
  Multiply: Multiply,
  Subtract: Subtract,
  Divide: Divide,
  Modulo: Modulo,
  LT: LT,
  LTE: LTE,
  GT: GT,
  GTE: GTE,
  And: And,
  Or: Or,
  Not: Not
};