'use strict';

var annotate = require('fn-annotate');
var Expr = require('./Expr');
var errors = require('./errors');
var values = require('./values');
var objectAssign = require('object-assign');

/**
 * This module contains functions used to construct FaunaDB Queries.
 *
 * See the [FaunaDB Query API Documentation](https://fauna.com/documentation/queries)
 * for per-function documentation.
 *
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
 * See the [docs](https://fauna.com/documentation/queries#basic_forms).
 *
 * @param {module:query~ExprArg} vars
 * @param {module:query~ExprArg} in_expr
 * @return {Expr}
 * */
function Let(vars, in_expr) {
  return new Expr({ let: wrapValues(vars), in: wrap(in_expr) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#basic_forms).
 *
 * @param {module:query~ExprArg} varName
 * @return {Expr}
 * */
function Var(varName) {
  return new Expr({ var: wrap(varName) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#basic_forms).
 *
 * @param {module:query~ExprArg} condition
 * @param {module:query~ExprArg} then
 * @param {module:query~ExprArg} _else
 * @return {Expr}
 * */
function If(condition, then, _else) {
  return new Expr({ if: wrap(condition), then: wrap(then), else: wrap(_else) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#basic_form).
 *
 * @param {...module:query~ExprArg} args
 * @return {Expr}
 * */
function Do() {
  return new Expr({ do: wrap(varargs(arguments)) });
}

/** See the [docs](https://fauna.com/documentation/queries#basic_forms).
 *
 * @param {...module:query~ExprArg} fields
 * @return {Expr}
 * */
var objectFunction = function(fields) {
  return new Expr({ object: wrapValues(fields) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#basic_forms).
 *
 * Takes a Javascript function, and will transform it
 * into the appropriate FaunaDB query. For example:
 *
 * ```
 * Lambda(function(a) { return Add(a, a); });
 * // Returns { lambda: 'a', expr: { add: [{ var: a }, { var: a }] } }
 * ```
 * Note that the driver will handle wrapping all usages of the lambda's bound
 * variables with the {@link modules:query~Var} function.
 *
 * @param {function} func
 *   Takes the provided function and produces the appropriate FaunaDB query expression.
 * @return {Expr}
 *
 *//**
 * See the [docs](https://fauna.com/documentation/queries#basic_forms).
 *
 * Directly produces a FaunaDB Lambda expression as described in the FaunaDB reference
 * documentation.
 *
 * @param {module:query~ExprArg} var_name
 *   The names of the variables to be bound in this lambda expression.
 * @param {module:query~ExprArg} expr
 *   The lambda expression.
 * @return {Expr}
 */
function Lambda() {
  switch(arguments.length) {
    case 1:
      var value = arguments[0];
      if (value instanceof Function) {
        return _lambdaFunc(value);
      } else if (value instanceof Expr) {
        return value;
      } else {
        throw new errors.InvalidValue('Lambda function takes either a Function or an Expr.');
      }
    case 2:
      var var_name = arguments[0];
      var expr = arguments[1];

      return _lambdaExpr(var_name, expr);
    default:
      throw new errors.InvalidValue('Lambda function takes either 1 or 2 arguments.');
  }
}

/**
 * @private
 */
function _lambdaFunc(func) {
  var vars = annotate(func);
  switch (vars.length) {
    case 0:
      throw new errors.InvalidValue('Provided Function must take at least 1 argument.');
    case 1:
      return _lambdaExpr(vars[0], func(Var(vars[0])));
    default:
      return _lambdaExpr(vars, func.apply(null, vars.map(Var)));
  }
}

/**
 * @private
 */
function _lambdaExpr(var_name, expr) {
  return new Expr({ lambda: wrap(var_name), expr: wrap(expr) });
}

// Collection functions

/** See the [docs](https://fauna.com/documentation/queries#collection_functions).
 *
 * @param {module:query~ExprArg} collection
 * @param {module:query~ExprArg|function} lambda_expr
 * @return {Expr}
 * */
function Map(collection, lambda_expr) {
  return new Expr({ map: wrap(lambda_expr), collection: wrap(collection) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#collection_functions).
 *
 * @param {module:query~ExprArg} collection
 * @param {module:query~ExprArg|function} lambda_expr
 * @return {Expr}
 * */
function Foreach(collection, lambda_expr) {
  return new Expr({ foreach: wrap(lambda_expr), collection: wrap(collection) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#collection_functions).
 *
 * @param {module:query~ExprArg} collection
 * @param {module:query~ExprArg|function} lambda_expr
 * @return {Expr}
 * */
function Filter(collection, lambda_expr) {
  return new Expr({ filter: wrap(lambda_expr), collection: wrap(collection) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#collection_functions).
 *
 * @param {module:query~ExprArg} number
 * @param {module:query~ExprArg} collection
 * @return {Expr}
 * */
function Take(number, collection) {
  return new Expr({ take: wrap(number), collection: wrap(collection) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#collection_functions).
 *
 * @param {module:query~ExprArg} number
 * @param {module:query~ExprArg} collection
 * @return {Expr}
 * */
function Drop(number, collection) {
  return new Expr({ drop: wrap(number), collection: wrap(collection) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#collection_functions).
 *
 * @param {module:query~ExprArg} elements
 * @param {module:query~ExprArg} collection
 * @return {Expr}
 */
function Prepend(elements, collection) {
  return new Expr({ prepend: wrap(elements), collection: wrap(collection) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#collection_functions).
 *
 * @param {module:query~ExprArg} elements
 * @param {module:query~ExprArg} collection
 * @return {Expr}
 */
function Append(elements, collection) {
  return new Expr({ append: wrap(elements), collection: wrap(collection) });
}

// Read functions

/**
 * See the [docs](https://fauna.com/documentation/queries#read_functions).
 *
 * @param {module:query~ExprArg} ref
 * @param {?module:query~ExprArg} ts
 * @return {Expr}
 */
function Get(ref, ts) {
  ts = defaults(ts, null);

  return new Expr(params({ get: wrap(ref) }, { ts: wrap(ts) }));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#read_functions).
 * You may want to utilize {@link Client#paginate} to obtain a {@link PageHelper},
 * rather than using this query function directly.
 *
 * @param {module:query~ExprArg} set
 * @param {?Object} opts
 * @return {Expr}
 */
function Paginate(set, opts) {
  opts = defaults(opts, {});

  return new Expr(objectAssign({ paginate: wrap(set) }, wrapValues(opts)));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#read_functions).
 *
 * @param {module:query~ExprArg} ref
 * @param {?module:query~ExprArg} ts
 * @return {Expr}
 */
function Exists(ref, ts) {
  ts = defaults(ts, null);

  return new Expr(params({ exists: wrap(ref) }, { ts: wrap(ts) }));
}

// Write functions

/**
 * See the [docs](https://fauna.com/documentation/queries#write_functions).
 *
 * @param {module:query~ExprArg} class_ref
 * @param {?module:query~ExprArg} params
 * @return {Expr}
 */
function Create(class_ref, params) {
  return new Expr({ create: wrap(class_ref), params: wrap(params) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#write_functions).
 *
 * @param {module:query~ExprArg} ref
 * @param {module:query~ExprArg} params
 * @return {Expr}
 */
function Update(ref, params) {
  return new Expr({ update: wrap(ref), params: wrap(params) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#write_functions).
 *
 * @param {module:query~ExprArg} ref
 * @param {module:query~ExprArg} params
 * @return {Expr}
 */
function Replace(ref, params) {
  return new Expr({ replace: wrap(ref), params: wrap(params) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#write_functions).
 *
 * @param {module:query~ExprArg} ref
 * @return {Expr}
 */
function Delete(ref) {
  return new Expr({ delete: wrap(ref) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#write_functions).
 *
 * @param {module:query~ExprArg} ref
 * @param {module:query~ExprArg} ts
 * @param {module:query~ExprArg} action
 * @param {module:query~ExprArg} params
 * @return {Expr}
 */
function Insert(ref, ts, action, params) {
  return new Expr({ insert: wrap(ref), ts: wrap(ts), action: wrap(action), params: wrap(params) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#write_functions).
 *
 * @param {module:query~ExprArg} ref
 * @param {module:query~ExprArg} ts
 * @param {module:query~ExprArg} action
 * @return {Expr}
 */
function Remove(ref, ts, action) {
  return new Expr({ remove: wrap(ref), ts: wrap(ts), action: wrap(action) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#write_functions).
 *
 * @param {?module:query~ExprArg} params
 * @return {Expr}
 */
function CreateClass(params) {
  return new Expr({ create_class: wrap(params) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#write_functions).
 *
 * @param {?module:query~ExprArg} params
 * @return {Expr}
 */
function CreateDatabase(params) {
  return new Expr({ create_database: wrap(params) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#write_functions).
 *
 * @param {?module:query~ExprArg} params
 * @return {Expr}
 */
function CreateIndex(params) {
  return new Expr({ create_index: wrap(params) });
}

// Sets

/**
 * See the [docs](https://fauna.com/documentation/queries#sets).
 *
 * @param {module:query~ExprArg} index
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function Match(index) {
  var args = argsToArray(arguments);
  args.shift();
  return new Expr({ match: wrap(index), terms: wrap(varargs(args)) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#sets).
 *
 * @param {...module:query~ExprArg} sets
 * @return {Expr}
 */
function Union() {
  return new Expr({ union: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#sets).
 *
 * @param {...module:query~ExprArg} sets
 * @return {Expr}
 * */
function Intersection() {
  return new Expr({ intersection: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#sets).
 *
 * @param {...module:query~ExprArg} sets
 * @return {Expr}
 * */
function Difference() {
  return new Expr({ difference: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#sets).
 *
 * @param {module:query~ExprArg} set
 * @return {Expr}
 * */
function Distinct(set) {
  return new Expr({ distinct: wrap(set) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#sets).
 *
 * @param {module:query~ExprArg} source
 * @param {module:query~ExprArg|function} target
 * @return {Expr}
 */
function Join(source, target) {
  return new Expr({ join: wrap(source), with: wrap(target) });
}

// Authentication

/**
 * See the [docs](https://fauna.com/documentation/queries#auth_functions).
 *
 * @param {module:query~ExprArg} ref
 * @param {module:query~ExprArg} params
 * @return {Expr}
 * */
function Login(ref, params) {
  return new Expr({ login: wrap(ref), params: wrap(params) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#auth_functions).
 *
 * @param {module:query~ExprArg} delete_tokens
 * @return {Expr}
 */
function Logout(delete_tokens) {
  return new Expr({ logout: wrap(delete_tokens) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#auth_functions).
 *
 * @param {module:query~ExprArg} ref
 * @param {module:query~ExprArg} password
 * @return {Expr}
 */
function Identify(ref, password) {
  return new Expr({ identify: wrap(ref), password: wrap(password) });
}

// String functions

/**
 * See the [docs](https://fauna.com/documentation/queries#string_functions).
 *
 * @param {module:query~ExprArg} strings
 * @param {?module:query~ExprArg} separator
 * @return {Expr}
 */
function Concat(strings, separator) {
  separator = defaults(separator, null);
  return new Expr(params({ concat: wrap(strings) }, { separator: wrap(separator) }));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string_functions).
 *
 * @param {module:query~ExprArg} string
 * @return {Expr}
 */
function Casefold(string) {
  return new Expr({ casefold: wrap(string) });
}

// Time and date functions
/**
 * See the [docs](https://fauna.com/documentation/queries#time_functions).
 *
 * @param {module:query~ExprArg} string
 * @return {Expr}
 */
function Time(string) {
  return new Expr({ time: wrap(string) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#time_functions).
 *
 * @param {module:query~ExprArg} number
 * @param {module:query~ExprArg} unit
 * @return {Expr}
 */
function Epoch(number, unit) {
  return new Expr({ epoch: wrap(number), unit: wrap(unit) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#time_functions).
 *
 * @param {module:query~ExprArg} string
 * @return {Expr}
 */
function Date(string) {
  return new Expr({ date: wrap(string) });
}

// Miscellaneous functions

/**
 * See the [docs](https://fauna.com/documentation/queries#misc_functions).
 *
 * @return {Expr}
 */
function NextID() {
  return new Expr({ next_id: null });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#misc_functions).
 *
 * @param {module:query~ExprArg} name
 * @return {Expr}
 */
function Database(name) {
  return new Expr({ database: wrap(name) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#misc_functions).
 *
 * @param {module:query~ExprArg} name
 * @return {Expr}
 */
function Index(name) {
  return new Expr({ index: wrap(name) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#misc_functions).
 *
 * @param {module:query~ExprArg} name
 * @return {Expr}
 */
function Class(name) {
  return new Expr({ class: wrap(name) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function Equals() {
  return new Expr({ equals: varargs(arguments) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#misc_functions).
 *
 * @param {module:query~ExprArg} path
 * @param {module:query~ExprArg} _in
 * @return {Expr}
 */
function Contains(path, _in) {
  return new Expr({ contains: wrap(path), in: wrap(_in) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#misc_functions).
 *
 * @param {module:query~ExprArg} path
 * @param {module:query~ExprArg} from
 * @param {?module:query~ExprArg} _default
 * @return {Expr}
 */
function Select(path, from, _default) {
  var exprObj = { select: wrap(path), from: wrap(from) };
  if (_default !== undefined) {
    exprObj.default = wrapValues(_default);
  }
  return new Expr(exprObj);
}

/**
 * See the [docs](https://fauna.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function Add() {
  return new Expr({ add: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function Multiply() {
  return new Expr({ multiply: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function Subtract() {
  return new Expr({ subtract: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function Divide() {
  return new Expr({ divide: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function Modulo() {
  return new Expr({ modulo: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function LT() {
  return new Expr({ lt: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function LTE() {
  return new Expr({ lte: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function GT() {
  return new Expr({ gt: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function GTE() {
  return new Expr({ gte: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function And() {
  return new Expr({ and: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#misc_functions).
 *
 * @param {...module:query~ExprArg} terms
 * @return {Expr}
 */
function Or() {
  return new Expr({ or: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://fauna.com/documentation/queries#misc_functions).
 *
 * @param {module:query~ExprArg} boolean
 * @return {Expr}
 */
function Not(boolean) {
  return new Expr({ not: wrap(boolean) });
}

// Helpers

/** Adds optional parameters to the query.
 *
 * @ignore
 * */
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
 *
 * @ignore
 */
function varargs(values) {
  var valuesAsArr = Array.isArray(values) ? values : Array.prototype.slice.call(values);
  return values.length === 1 ? values[0] : valuesAsArr;
}

/**
 * @ignore
 */
function argsToArray(args) {
  var rv = [];
  rv.push.apply(rv, args);
  return rv;
}

/**
 * @ignore
 */
function defaults(param, def) {
  if (param === undefined) {
    return def;
  } else {
    return param;
  }
}

/**
 * Wraps an object as an Expression. This will automatically wrap any bare objects with
 * the appropriate {@link object} escaping.
 * @param {Object} obj
 *  The object to be wrapped as an Expression.
 * @returns {Expr}
 *   The expression wrapping the provided object.
 * @private
 */
function wrap(obj) {
  if (obj === null) {
    return null;
  } else if (obj instanceof Expr) {
    return obj;
  } else if (obj instanceof Function) {
    return Lambda(obj);
  } else if (obj instanceof Array) {
    return new Expr(obj.map(function (elem) {
      return wrap(elem);
    }));
  } else if (typeof obj === 'object') {
    return new Expr({ object: wrapValues(obj) });
  } else {
    return obj;
  }
}

/**
 * Wraps all of the values of a provided Object, while leaving the parent object unwrapped.
 * @param {Object} obj
 *  The object whose values are to be wrapped as Expressions.
 * @returns {Object}
 *  A copy of the provided object, with the values wrapped as Expressions.
 * @private
 */
function wrapValues(obj) {
  if (obj !== null) {
    var rv = {};

    Object.keys(obj).forEach(function(key) {
      rv[key] = wrap(obj[key]);
    });

    return rv;
  } else {
    return null;
  }
}

module.exports = {
  Ref: Ref,
  Let: Let,
  Var: Var,
  If: If,
  Do: Do,
  Object: objectFunction,
  Lambda: Lambda,
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
  Create: Create,
  Update: Update,
  Replace: Replace,
  Delete: Delete,
  Insert: Insert,
  Remove: Remove,
  CreateClass: CreateClass,
  CreateDatabase: CreateDatabase,
  CreateIndex: CreateIndex,
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
  NextId: NextID,
  Database: Database,
  Index: Index,
  Class: Class,
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
  Not: Not,
  wrap: wrap
};
