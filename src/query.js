'use strict';

var annotate = require('fn-annotate');
var deprecate = require('util-deprecate');
var Expr = require('./Expr');
var errors = require('./errors');
var values = require('./values');
var objectAssign = require('object-assign');

/**
 * This module contains functions used to construct FaunaDB Queries.
 *
 * See the [FaunaDB Query API Documentation](https://app.fauna.com/documentation/reference/queryapi)
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
 * If one parameter is provided, constructs a literal Ref value.
 * The string `classes/widget/123` will be equivalent to `new values.Ref('123', new values.Ref('widget', values.Native.CLASSES))`
 *
 * If two are provided, constructs a Ref() function that, when evaluated, returns a Ref value.
 *
 * @param {string|module:query~ExprArg} ref|cls
 *   Alone, the ref in path form. Combined with `id`, must be a class ref.
 * @param {module:query~ExprArg} [id]
 *   A numeric id of the given class.
 * @return {Expr}
 */
function Ref() {
  arity.between(1, 2, arguments);
  switch (arguments.length) {
    case 1: return new Expr({ '@ref': wrap(arguments[0]) });
    case 2: return new Expr({ ref: wrap(arguments[0]), id: wrap(arguments[1]) });
  }
}

/**
 * @param {Uint8Array|ArrayBuffer|module:query~ExprArg} bytes
 *   A base64 encoded string or a byte array
 * @return {Expr}
 */
function Bytes(bytes) {
  arity.exact(1, arguments);
  return new values.Bytes(bytes);
}

// Basic forms

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * @param {module:query~ExprArg} msg
 *   The message to send back to the client.
 * @return {Expr}
 * */
function Abort(msg) {
  arity.exact(1, arguments);
  return new Expr({ abort: wrap(msg) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * @param {module:query~ExprArg} timestamp
 *   An Expr that will evaluate to a Time.
 * @param {module:query~ExprArg} expr
 *   The Expr to run at the given snapshot time.
 * @return {Expr}
 * */
function At(timestamp, expr) {
  arity.exact(2, arguments);
  return new Expr({ at: wrap(timestamp), expr: wrap(expr) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * @param {module:query~ExprArg} bindings
 *   A set of bindings to use within the given expression.
 * @param {module:query~ExprArg} in
 *   The expression to run with the given bindings.
 * @return {Expr}
 * */
function Let(vars, in_expr) {
  arity.exact(2, arguments);
  var expr = in_expr;
  var bindings = Object.keys(vars).map(function (k) {
    var b = {};
    b[k] = wrap(vars[k]);
    return b;
  });

  if (typeof expr === 'function') {
    expr = expr.apply(null, Object.keys(vars).map(function(name) {
      return Var(name);
    }));
  }

  return new Expr({ let: bindings, in: wrap(expr) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * @param {module:query~ExprArg} varName
 *   The name of the bound var.
 * @return {Expr}
 * */
function Var(varName) {
  arity.exact(1, arguments);
  return new Expr({ var: wrap(varName) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * @param {module:query~ExprArg} condition
 *   An expression that returns a boolean.
 * @param {module:query~ExprArg} then
 *   The expression to run if condition is true.
 * @param {module:query~ExprArg} else
 *   The expression to run if the condition is false.
 * @return {Expr}
 * */
function If(condition, then, _else) {
  arity.exact(3, arguments);
  return new Expr({ if: wrap(condition), then: wrap(then), else: wrap(_else) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * @param {...module:query~ExprArg} args
 *   A series of expressions to run.
 * @return {Expr}
 * */
function Do() {
  arity.min(1, arguments);
  var args = argsToArray(arguments);
  return new Expr({ do: wrap(args) });
}

/** See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * @param {...module:query~ExprArg} fields
 *   The object to be escaped.
 * @return {Expr}
 * */
var objectFunction = function(fields) {
  arity.exact(1, arguments);
  return new Expr({ object: wrapValues(fields) });
};

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
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
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * Directly produces a FaunaDB Lambda expression as described in the FaunaDB reference
 * documentation.
 *
 * @param {module:query~ExprArg} var
 *   The names of the variables to be bound in this lambda expression.
 * @param {module:query~ExprArg} expr
 *   The lambda expression.
 * @return {Expr}
 */
function Lambda() {
  arity.between(1, 2, arguments);
  switch(arguments.length) {
    case 1:
      var value = arguments[0];
      if (typeof value === 'function') {
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
      return _lambdaExpr(vars, func.apply(null, vars.map(function(name) { return Var(name); })));
  }
}

/**
 * @private
 */
function _lambdaExpr(var_name, expr) {
  return new Expr({ lambda: wrap(var_name), expr: wrap(expr) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * Invokes a given function passing in the provided arguments
 *
 * ```
 * Call(Ref("functions/a_function"), 1, 2)
 * ```
 *
 * @param {module:query~ExprArg} ref
 *   The ref of the UserDefinedFunction to call
 * @param {...module:query~ExprArg} args
 *   A series of values to pass as arguments to the UDF.
 * @return {Expr}
 * */
function Call(ref) {
  arity.min(1, arguments);
  var args = argsToArray(arguments);
  args.shift();
  return new Expr({ call: wrap(ref), arguments: varargs(args) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * Constructs a `@query` type using the Lambda() or a function.
 *
 * ```
 * Query(Lambda(['a', 'b'], Add(Var('a'), Var('b'))))
 * Query(function (a, b) { return Add(a, b) })
 * ```
 *
 * @param {module:query~ExprArg|function} lambda
 *   A function to escape as a query.
 * @return {Expr}
 * */
function Query(lambda) {
  arity.exact(1, arguments);
  return new Expr({ query: wrap(lambda) });
}

// Collection functions

/** See the [docs](https://app.fauna.com/documentation/reference/queryapi#collections).
 *
 * @param {module:query~ExprArg} collection
 *   An expression resulting in a collection to be mapped over.
 * @param {module:query~ExprArg|function} lambda
 *   A function to be called for each element of the collection.
 * @return {Expr}
 * */
function Map(collection, lambda_expr) {
  arity.exact(2, arguments);
  return new Expr({ map: wrap(lambda_expr), collection: wrap(collection) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#collections).
 *
 * @param {module:query~ExprArg} collection
 *   An expression resulting in a collection to be iterated over.
 * @param {module:query~ExprArg|function} lambda
 *   A function to be called for each element of the collection.
 * @return {Expr}
 * */
function Foreach(collection, lambda_expr) {
  arity.exact(2, arguments);
  return new Expr({ foreach: wrap(lambda_expr), collection: wrap(collection) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#collections).
 *
 * @param {module:query~ExprArg} collection
 *   An expression resulting in a collection to be filtered.
 * @param {module:query~ExprArg|function} lambda
 *   A function that returns a boolean used to filter unwanted values.
 * @return {Expr}
 * */
function Filter(collection, lambda_expr) {
  arity.exact(2, arguments);
  return new Expr({ filter: wrap(lambda_expr), collection: wrap(collection) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#collections).
 *
 * @param {module:query~ExprArg} number
 *   An expression resulting in the number of elements to take from the collection.
 * @param {module:query~ExprArg} collection
 *   An expression resulting in a collection.
 * @return {Expr}
 * */
function Take(number, collection) {
  arity.exact(2, arguments);
  return new Expr({ take: wrap(number), collection: wrap(collection) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#collections).
 *
 * @param {module:query~ExprArg} number
 *   An expression resulting in the number of elements to drop from the collection.
 * @param {module:query~ExprArg} collection
 *   An expression resulting in a collection.
 * @return {Expr}
 * */
function Drop(number, collection) {
  arity.exact(2, arguments);
  return new Expr({ drop: wrap(number), collection: wrap(collection) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#collections).
 *
 * @param {module:query~ExprArg} elements
 *   An expression resulting in a collection of elements to prepend to the given collection.
 * @param {module:query~ExprArg} collection
 *   An expression resulting in a collection.
 * @return {Expr}
 */
function Prepend(elements, collection) {
  arity.exact(2, arguments);
  return new Expr({ prepend: wrap(elements), collection: wrap(collection) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#collections).
 *
 * @param {module:query~ExprArg} elements
 *   An expression resulting in a collection of elements to append to the given collection.
 * @param {module:query~ExprArg} collection
 *   An expression resulting in a collection.
 * @return {Expr}
 */
function Append(elements, collection) {
  arity.exact(2, arguments);
  return new Expr({ append: wrap(elements), collection: wrap(collection) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#collections).
 *
 * @param {module:query~ExprArg} collection
 *   An expression resulting in a collection.
 * @return {Expr}
 */
function IsEmpty(collection) {
  arity.exact(1, arguments);
  return new Expr({ is_empty: wrap(collection) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#collections).
 *
 * @param {module:query~ExprArg} collection
 *   An expression resulting in a collection.
 * @return {Expr}
 */
function IsNonEmpty(collection) {
  arity.exact(1, arguments);
  return new Expr({ is_nonempty: wrap(collection) });
}

// Read functions

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#read-functions).
 *
 * @param {module:query~ExprArg} ref
 *   An expression resulting in either a Ref or SetRef.
 * @param {?module:query~ExprArg} ts
 *   The snapshot time at which to get the instance.
 * @return {Expr}
 */
function Get(ref, ts) {
  arity.between(1, 2, arguments);
  ts = defaults(ts, null);

  return new Expr(params({ get: wrap(ref) }, { ts: wrap(ts) }));
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#read-functions).
 *
 * @param {module:query~ExprArg} secret
 *   The key or token secret to lookup.
 * @return {Expr}
 */
function KeyFromSecret(secret) {
  arity.exact(1, arguments);
  return new Expr({ key_from_secret: wrap(secret) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#read-functions).
 * You may want to utilize {@link Client#paginate} to obtain a {@link PageHelper},
 * rather than using this query function directly.
 *
 * @param {module:query~ExprArg} set
 *   An expression resulting in a SetRef to page over.
 * @param {?Object} opts
 *  An object representing options for pagination.
 *    - size: Maximum number of results to return.
 *    - after: Return the next page of results after this cursor (inclusive).
 *    - before: Return the previous page of results before this cursor (exclusive).
 *    - sources: If true, include the source sets along with each element.
 * @return {Expr}
 */
function Paginate(set, opts) {
  arity.between(1, 2, arguments);
  opts = defaults(opts, {});

  return new Expr(objectAssign({ paginate: wrap(set) }, wrapValues(opts)));
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#read-functions).
 *
 * @param {module:query~ExprArg} ref
 *   An expression resulting in a Ref.
 * @param {?module:query~ExprArg} ts
 *   The snapshot time at which to check for the instance's existence.
 * @return {Expr}
 */
function Exists(ref, ts) {
  arity.between(1, 2, arguments);
  ts = defaults(ts, null);

  return new Expr(params({ exists: wrap(ref) }, { ts: wrap(ts) }));
}

// Write functions

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} ref
 *   The Ref (usually a ClassRef) to create.
 * @param {?module:query~ExprArg} params
 *   An object representing the parameters of the instance.
 * @return {Expr}
 */
function Create(class_ref, params) {
  arity.between(1, 2, arguments);
  return new Expr({ create: wrap(class_ref), params: wrap(params) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} ref
 *   The Ref to update.
 * @param {module:query~ExprArg} params
 *   An object representing the parameters of the instance.
 * @return {Expr}
 */
function Update(ref, params) {
  arity.exact(2, arguments);
  return new Expr({ update: wrap(ref), params: wrap(params) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} ref
 *   The Ref to replace.
 * @param {module:query~ExprArg} params
 *   An object representing the parameters of the instance.
 * @return {Expr}
 */
function Replace(ref, params) {
  arity.exact(2, arguments);
  return new Expr({ replace: wrap(ref), params: wrap(params) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} ref
 *   The Ref to delete.
 * @return {Expr}
 */
function Delete(ref) {
  arity.exact(1, arguments);
  return new Expr({ delete: wrap(ref) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} ref
 *   The Ref to insert against
 * @param {module:query~ExprArg} ts
 *   The valid time of the inserted event
 * @param {module:query~ExprArg} action
 *   Whether the event should be a Create, Update, or Delete.
 * @param {module:query~ExprArg} params
 *   If this is a Create or Update, the parameters of the instance.
 * @return {Expr}
 */
function Insert(ref, ts, action, params) {
  arity.exact(4, arguments);
  return new Expr({ insert: wrap(ref), ts: wrap(ts), action: wrap(action), params: wrap(params) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} ref
 *   The Ref of the instance whose event should be removed.
 * @param {module:query~ExprArg} ts
 *   The valid time of the event.
 * @param {module:query~ExprArg} action
 *   The event action (Create, Update, or Delete) that should be removed.
 * @return {Expr}
 */
function Remove(ref, ts, action) {
  arity.exact(3, arguments);
  return new Expr({ remove: wrap(ref), ts: wrap(ts), action: wrap(action) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} params
 *   An object of parameters used to create a class.
 *     - name (required): the name of the class to create
 * @return {Expr}
 */
function CreateClass(params) {
  arity.exact(1, arguments);
  return new Expr({ create_class: wrap(params) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} params
 *   An object of parameters used to create a database.
 *     - name (required): the name of the database to create
 * @return {Expr}
 */
function CreateDatabase(params) {
  arity.exact(1, arguments);
  return new Expr({ create_database: wrap(params) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} params
 *   An object of parameters used to create an index.
 *     - name (required): the name of the index to create
 *     - source: One or more source objects describing source classes and (optional) field bindings.
 *     - terms: An array of term objects describing the fields to be indexed. Optional
 *     - values: An array of value objects describing the fields to be covered. Optional
 *     - unique: If true, maintains a uniqueness constraint on combined terms and values. Optional
 *     - partitions: The number of sub-partitions within each term. Optional
 * @return {Expr}
 */
function CreateIndex(params) {
  arity.exact(1, arguments);
  return new Expr({ create_index: wrap(params) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} params
 *   An object of parameters used to create a new key
 *     - database: Ref of the database the key will be scoped to
 *     - role: The role of the new key
 * @return {Expr}
 */
function CreateKey(params) {
  arity.exact(1, arguments);
  return new Expr({ create_key: wrap(params) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#write-functions).
 *
 * @param {module:query~ExprArg} params
 *   An objet of parameters used to create a new user defined function.
 *     - name: The name of the function
 *     - body: A lambda function (escaped with `query`).
 * @return {Expr}
 */
function CreateFunction(params) {
  arity.exact(1, arguments);
  return new Expr({ create_function: wrap(params) });
}

// Sets

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#sets).
 *
 * @param {module:query~ExprArg} ref
 *   The Ref of the instance for which to retrieve the singleton set.
 * @return {Expr}
 */
function Singleton(ref) {
  arity.exact(1, arguments);
  return new Expr({ singleton: wrap(ref) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#sets).
 *
 * @param {module:query~ExprArg} ref
 *   A Ref or SetRef to retrieve an event set from.
 * @return {Expr}
 */
function Events(ref_set) {
  arity.exact(1, arguments);
  return new Expr({ events: wrap(ref_set) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#sets).
 *
 * @param {module:query~ExprArg} index
 *   The Ref of the index to match against.
 * @param {...module:query~ExprArg} terms
 *   A list of terms used in the match.
 * @return {Expr}
 */
function Match(index) {
  arity.min(1, arguments);
  var args = argsToArray(arguments);
  args.shift();
  return new Expr({ match: wrap(index), terms: wrap(varargs(args)) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#sets).
 *
 * @param {...module:query~ExprArg} sets
 *   A list of SetRefs to union together.
 * @return {Expr}
 */
function Union() {
  arity.min(1, arguments);
  return new Expr({ union: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#sets).
 *
 * @param {...module:query~ExprArg} sets
 *   A list of SetRefs to intersect.
 * @return {Expr}
 * */
function Intersection() {
  arity.min(1, arguments);
  return new Expr({ intersection: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#sets).
 *
 * @param {...module:query~ExprArg} sets
 *   A list of SetRefs to diff.
 * @return {Expr}
 * */
function Difference() {
  arity.min(1, arguments);
  return new Expr({ difference: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#sets).
 *
 * @param {module:query~ExprArg} set
 *   A SetRef to remove duplicates from.
 * @return {Expr}
 * */
function Distinct(set) {
  arity.exact(1, arguments);
  return new Expr({ distinct: wrap(set) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#sets).
 *
 * @param {module:query~ExprArg} source
 *   A SetRef of the source set
 * @param {module:query~ExprArg|function} target
 *   A Lambda that will accept each element of the source Set and return a Set
 * @return {Expr}
 */
function Join(source, target) {
  arity.exact(2, arguments);
  return new Expr({ join: wrap(source), with: wrap(target) });
}

// Authentication

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#authentication).
 *
 * @param {module:query~ExprArg} ref
 *   A Ref with credentials to authenticate against
 * @param {module:query~ExprArg} params
 *   An object of parameters to pass to the login function
 *     - password: The password used to login
 * @return {Expr}
 * */
function Login(ref, params) {
  arity.exact(2, arguments);
  return new Expr({ login: wrap(ref), params: wrap(params) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#authentication).
 *
 * @param {module:query~ExprArg} delete_tokens
 *   If true, log out all tokens associated with the current session.
 * @return {Expr}
 */
function Logout(delete_tokens) {
  arity.exact(1, arguments);
  return new Expr({ logout: wrap(delete_tokens) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#authentication).
 *
 * @param {module:query~ExprArg} ref
 *   The Ref to check the password against.
 * @param {module:query~ExprArg} password
 *   The credentials password to check.
 * @return {Expr}
 */
function Identify(ref, password) {
  arity.exact(2, arguments);
  return new Expr({ identify: wrap(ref), password: wrap(password) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#authentication).
 *
 * @return {Expr}
 */
function Identity() {
  arity.exact(0, arguments);
  return new Expr({ identity: null });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#authentication).
 *
 * @return {Expr}
 */
function HasIdentity() {
  arity.exact(0, arguments);
  return new Expr({ has_identity: null });
}

// String functions

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#string-functions).
 *
 * @param {string} strings - A list of strings to concatenate.
 * @param {string} separator  - The separator to use between each string.
 * @return {string} a single combined string
 */
function Concat(strings, separator) {
  arity.min(1, arguments);
  separator = defaults(separator, null);
  return new Expr(params({ concat: wrap(strings) }, { separator: wrap(separator) }));
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#string-functions).
 *
 * @param {string} string - The string to casefold.
 * @param {string} normalizer - The algorithm to use. One of: NFKCCaseFold, NFC, NFD, NFKC, NFKD.
 * @return {string} a normalized string
 */
function Casefold(string, normalizer) {
  arity.min(1, arguments);
  return new Expr(params({ casefold: wrap(string) }, { normalizer: wrap(normalizer) }));
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#string-functions).
 *
 * @param {string} value - A string to search.
 * @param {string} find - Find the first position of this string in the search string
 * @param {int} start - An optional start offset into the search string
 * @return {int} location of the found string or -1 if not found
 */
function FindStr(value, find, start) {
  arity.between(2, 3, arguments);
  start = defaults(start, null);
  return new Expr(params({ findstr: wrap(value) }, { find: wrap(find) }, { start: wrap(start) }));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string-functions).
 *
 * @param {string} value - A string to search.
 * @param {string} pattern - Find the first position of this pattern in the search string using a java regular expression syntax
 * @param {int} start - An optional start offset into the search string
 * @param {int} numResults - An optional number of results to return, max 1024
 * @return {Array} an array of object describing where the search pattern was located
 */
function FindStrRegex(value, pattern, start, numResults) {
  arity.between(2, 4, arguments);
  start = defaults(start, null);
  return new Expr(params({ findstrregex: wrap(value) }, { pattern: wrap(pattern) }, { start: wrap(start) }, { num_results: wrap(numResults) }));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string-functions).
 *
 * @param {string} value - The string to calculate the length in codepoints.
 * @return {int} the length of the string in codepoints
 */
function Length(value) {
  arity.exact(1, arguments);
  return new Expr(params({ length: wrap(value) }));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string-functions).
 *
 * @param {string} value - The string to LowerCase.
 * @return {string} the string converted to lowercase
 */
function LowerCase(value) {
  arity.exact(1, arguments);
  return new Expr(params({ lowercase: wrap(value) }));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string-functions).
 *
 * @param {string} value - The string to trim leading white space.
 * @return {string} the string with leading white space removed
 */
function LTrim(value) {
  arity.exact(1, arguments);
  return new Expr(params({ ltrim: wrap(value) }));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A string to search.
 * @param {...module:query~ExprArg} terms
 *   Find the first position of this string in the search string
 * @param {...module:query~ExprArg} terms
 *   An optional start offset into the search string
 * @return {Expr}
 */
function FindStr(value, find, start) {
  arity.between(2, 3, arguments);
  start = defaults(start, null);
  return new Expr(params({ findstr: wrap(value) }, { find: wrap(find) }, { start: wrap(start) }));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string_functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A string to search.
 * @param {...module:query~ExprArg} terms
 *   Find the first position of this string in the search string
 * @param {...module:query~ExprArg} terms
 *   An optional start offset into the search string
 * @param {...module:query~ExprArg} terms
 *   An optional number of results to return, max 1024
 * @return {Expr}
 */
function FindStrRegex(value, pattern, start, numResults) {
  arity.between(2, 4, arguments);
  start = defaults(start, null);
  return new Expr(params({ findstrregex: wrap(value) }, { pattern: wrap(pattern) }, { start: wrap(start) }, { num_results: wrap(numResults) }));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string_functions).
 *
 * @param {module:query~ExprArg} string
 *   The string to calculate the length in codepoints.
 * @return {Expr}
 */
function Length(expr) {
  arity.exact(1, arguments);
  return new Expr(params({ length: wrap(expr) }));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string_functions).
 *
 * @param {module:query~ExprArg} string
 *   The string to LowerCase.
 * @return {Expr}
 */
function LowerCase(expr) {
  arity.exact(1, arguments);
  return new Expr(params({ lowercase: wrap(expr) }));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string_functions).
 *
 * @param {module:query~ExprArg} string
 *   The string to LowerCase.
 * @return {Expr}
 */
function LTrim(expr) {
  arity.exact(1, arguments);
  return new Expr(params({ ltrim: wrap(expr) }));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string_functions).
 *
 * @param {module:query~ExprArg} terms
 *   A document from which to produce ngrams.
 * @param {?Object} opts
 *   An object of options
 *     - min: The minimum ngram size.
 *     - max: The maximum ngram size.
 * @return {Array|Value}
 */
function NGram(terms, min, max) {
  arity.between(1, 3, arguments);
  min = defaults(min, null)
  max = defaults(max, null)

  return new Expr(params({ ngram: wrap(terms) }, { min: wrap(min), max: wrap(max) }));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string-functions).
 *
 * @param {string} value - A string to repeat.
 * @param {int} number - The number of times to repeat the string
 * @return {string} a string which was repeated
 */
function Repeat(value, number) {
  arity.between(1, 2, arguments);
  number = defaults(number, null);
  return new Expr(params({ repeat: wrap(value) }, { number: wrap(number) }));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string-functions).
 *
 * @param {string} value - A string to search.
 * @param {string} find - The string to find in the search string
 * @param {string} replace - The string to replace in the search string
 * @return {String} all the occurrences of find substituted with replace string
 */
function ReplaceStr(value, find, replace) {
  arity.exact(3, arguments);
  return new Expr(params({ replacestr: wrap(value) }, params({ find: wrap(find) }, { replace: wrap(replace) })));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string-functions).
 *
 * @param {string} value - A string to search.
 * @param {string} pattern - The pattern to find in the search string using a java regular expression syntax
 * @param {string} replace - The string to replace in the search string
 * @param {boolean} first - Replace all or just the first
 * @return {string} all the occurrences of find pattern substituted with replace string
 */
function ReplaceStrRegex(value, pattern, replace, first) {
  arity.between(3, 4, arguments);
  first = defaults(first, null);
  return new Expr(params({ replacestrregex: wrap(value) }, params( params({ pattern: wrap(pattern) }, { replace: wrap(replace) }), { first: wrap(first) }) ));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string-functions).
 *
 * @param {string} value - The string to remove white space from the end.
 * @return {string} the string with trailing whitespaces removed
 */
function RTrim(value) {
  arity.exact(1, arguments);
  return new Expr(params({ rtrim: wrap(value) }));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string-functions).
 *
 * @param {int} num - The string of N Space(s).
 * @return {string} a string with spaces
 */
function Space(num) {
  arity.exact(1, arguments);
  return new Expr(params({ space: wrap(num) }));
}
/**
 * See the [docs](https://fauna.com/documentation/queries#string-functions).
 *
 * @param {string} value  The string to SubString.
 * @param {int} start  The position the first character of the return string begins at
 * @param {int} length  An optional length, if omitted then returns to the end of string
 * @return {string}
 */
function SubString(value, start, length) {
  arity.between(1, 3, arguments);
  start = defaults(start, null);
  length = defaults(length, null);
  return new Expr(params({ substring: wrap(value) }, params({ start: wrap(start) }, { length: wrap(length) } )));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string-functions).
 *
 * @param {string} value - The string to TitleCase.
 * @return {string}  A string converted to titlecase
 */
function TitleCase(value) {
  arity.exact(1, arguments);
  return new Expr(params({ titlecase: wrap(value) }));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string-functions).
 *
 * @param {string} value - The string to Trim.
 * @return {string} a string with leading and trailing whitespace removed
 */
function Trim(value) {
  arity.exact(1, arguments);
  return new Expr(params({ trim: wrap(value) }));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string-functions).
 *
 * @param {string} value - The string to Uppercase.
 * @return {string} An uppercase string
 */
function UpperCase(value) {
  arity.exact(1, arguments);
  return new Expr(params({ uppercase: wrap(value) }));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string_functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A string to repeat.
 * @param {...module:query~ExprArg} terms
 *   The number of times to repeat the string
 * @return {Expr}
 */
function Repeat(value, number) {
  arity.between(1, 2, arguments);
  number = defaults(number, null);
  return new Expr(params({ repeat: wrap(value) }, { number: wrap(number) }));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string_functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A string to search.
 * @param {...module:query~ExprArg} terms
 *   The string to find in the search string
 * @param {...module:query~ExprArg} terms
 *   The string to replace in the search string
 * @return {Expr}
 */
function ReplaceStr(value, find, replace) {
  arity.exact(3, arguments);
  return new Expr(params({ replacestr: wrap(value) }, params({ find: wrap(find) }, { replace: wrap(replace) })));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string_functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A string to search.
 * @param {...module:query~ExprArg} terms
 *   The pattern to find in the search string
 * @param {...module:query~ExprArg} terms
 *   The string to replace in the search string
 * @param {...module:query~ExprArg} terms
 *   replace all or just the first
 * @return {Expr}
 */
function ReplaceStrRegex(value, pattern, replace, first) {
  arity.between(3, 4, arguments);
  first = defaults(first, null);
  return new Expr(params({ replacestrregex: wrap(value) }, params( params({ pattern: wrap(pattern) }, { replace: wrap(replace) }), { first: wrap(first) }) ));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string_functions).
 *
 * @param {module:query~ExprArg} string
 *   The string to remove white space from the end.
 * @return {Expr}
 */
function RTrim(expr) {
  arity.exact(1, arguments);
  return new Expr(params({ rtrim: wrap(expr) }));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string_functions).
 *
 * @param {module:query~ExprArg} string
 *   The string to Space.
 * @return {Expr}
 */
function Space(expr) {
  arity.exact(1, arguments);
  return new Expr(params({ space: wrap(expr) }));
}
/**
 * See the [docs](https://fauna.com/documentation/queries#string_functions).
 *
 * @param {module:query~ExprArg} string
 *   The string to SubString.
 * @return {Expr}
 */
function SubString(value, start, length) {
  arity.between(1, 3, arguments);
  start = defaults(start, null);
  length = defaults(length, null);
  return new Expr(params({ substring: wrap(value) }, params({ start: wrap(start) }, { length: wrap(length) } )));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string_functions).
 *
 * @param {module:query~ExprArg} string
 *   The string to TitleCase.
 * @return {Expr}
 */
function TitleCase(expr) {
  arity.exact(1, arguments);
  return new Expr(params({ titlecase: wrap(expr) }));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string_functions).
 *
 * @param {module:query~ExprArg} string
 *   The string to Trim.
 * @return {Expr}
 */
function Trim(expr) {
  arity.exact(1, arguments);
  return new Expr(params({ trim: wrap(expr) }));
}

/**
 * See the [docs](https://fauna.com/documentation/queries#string_functions).
 *
 * @param {module:query~ExprArg} string
 *   The string to Uppercase.
 * @return {Expr}
 */
function UpperCase(expr) {
  arity.exact(1, arguments);
  return new Expr(params({ uppercase: wrap(expr) }));
}

// Time and date functions
/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#time-and-date).
 *
 * @param {module:query~ExprArg} string
 *   A string to converted to a time object.
 * @return {Expr}
 */
function Time(string) {
  arity.exact(1, arguments);
  return new Expr({ time: wrap(string) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#time-and-date).
 *
 * @param {module:query~ExprArg} number
 *   The number of `unit`s from Epoch
 * @param {module:query~ExprArg} unit
 *   The unit of `number`. One of second, millisecond, microsecond, nanosecond.
 * @return {Expr}
 */
function Epoch(number, unit) {
  arity.exact(2, arguments);
  return new Expr({ epoch: wrap(number), unit: wrap(unit) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#time-and-date).
 *
 * @param {module:query~ExprArg} string
 *   A string to convert to a Date object
 * @return {Expr}
 */
function Date(string) {
  arity.exact(1, arguments);
  return new Expr({ date: wrap(string) });
}

// Miscellaneous functions

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @deprecated use NewId instead
 * @return {Expr}
 */
function NextId() {
  arity.exact(0, arguments);
  return new Expr({ next_id: null });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @return {Expr}
 */
function NewId() {
  arity.exact(0, arguments);
  return new Expr({ new_id: null });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @param {module:query~ExprArg} name
 *   The name of the database.
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the database's scope.
 * @return {Expr}
 */
function Database(name, scope) {
  arity.between(1, 2, arguments);
  switch(arguments.length) {
    case 1: return new Expr({ database: wrap(name) });
    case 2: return new Expr({ database: wrap(name), scope: wrap(scope) });
  }
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @param {module:query~ExprArg} name
 *   The name of the index.
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the index's scope.
 * @return {Expr}
 */
function Index(name, scope) {
  arity.between(1, 2, arguments);
  switch(arguments.length) {
    case 1: return new Expr({ index: wrap(name) });
    case 2: return new Expr({ index: wrap(name), scope: wrap(scope) });
  }
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @param {module:query~ExprArg} name
 *   The name of the class.
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the class's scope.
 * @return {Expr}
 */
function Class(name, scope) {
  arity.between(1, 2, arguments);
  switch(arguments.length) {
    case 1: return new Expr({ class: wrap(name) });
    case 2: return new Expr({ class: wrap(name), scope: wrap(scope) });
  }
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @param {module:query~ExprArg} name
 *   The name of the user defined function.
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the user defined function's scope.
 * @return {Expr}
 */
function FunctionFn(name, scope) {
  arity.between(1, 2, arguments);
  switch(arguments.length) {
    case 1: return new Expr({ function: wrap(name) });
    case 2: return new Expr({ function: wrap(name), scope: wrap(scope) });
  }
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * Constructs a `classes` function that, when evaluated, returns a Ref value.
 *
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the class set's scope.
 * @return {Expr}
 */
function Classes(scope) {
  arity.max(1, arguments);
  scope = defaults(scope, null);
  return new Expr({ classes: wrap(scope) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * Constructs a `databases` functions that, when evaluated, returns a Ref value.
 *
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the database set's scope.
 * @return {Expr}
 */
function Databases(scope) {
  arity.max(1, arguments);
  scope = defaults(scope, null);
  return new Expr({ databases: wrap(scope) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * Constructs an `indexes` function that, when evaluated, returns a Ref value.
 *
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the index set's scope.
 * @return {Expr}
 */
function Indexes(scope) {
  arity.max(1, arguments);
  scope = defaults(scope, null);
  return new Expr({ indexes: wrap(scope) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * Constructs a `functions` function that, when evaluated, returns a Ref value.
 *
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the user defined function set's scope.
 * @return {Expr}
 */
function Functions(scope) {
  arity.max(1, arguments);
  scope = defaults(scope, null);
  return new Expr({ functions: wrap(scope) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * Constructs a `keys` function that, when evaluated, returns a Ref value.
 *
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the key set's scope.
 * @return {Expr}
 */
function Keys(scope) {
  arity.max(1, arguments);
  scope = defaults(scope, null);
  return new Expr({ keys: wrap(scope) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * Constructs a `tokens` function that, when evaluated, returns a Ref value.
 *
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the token set's scope.
 * @return {Expr}
 */
function Tokens(scope) {
  arity.max(1, arguments);
  scope = defaults(scope, null);
  return new Expr({ tokens: wrap(scope) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * Constructs a `credentials` functions that, when evaluated, returns a Ref value.
 *
 * @param {module:query~ExprArg} [scope]
 *   The Ref of the credential set's scope.
 * @return {Expr}
 */
function Credentials(scope) {
  arity.max(1, arguments);
  scope = defaults(scope, null);
  return new Expr({ credentials: wrap(scope) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of expressions to check for equivalence.
 * @return {Expr}
 */
function Equals() {
  arity.min(1, arguments);
  return new Expr({ equals: varargs(arguments) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @param {module:query~ExprArg} path
 *   An array representing a path to check for the existence of.
 * @param {module:query~ExprArg} in
 *   An object to search against.
 * @return {Expr}
 */
function Contains(path, _in) {
  arity.exact(2, arguments);
  return new Expr({ contains: wrap(path), in: wrap(_in) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @param {module:query~ExprArg} path
 *   An array representing a path to pull from an object.
 * @param {module:query~ExprArg} from
 *   The object to select from
 * @param {?module:query~ExprArg} default
 *   A default value if the path does not exist.
 * @return {Expr}
 */
function Select(path, from, _default) {
  arity.between(2, 3, arguments);
  var exprObj = { select: wrap(path), from: wrap(from) };
  if (_default !== undefined) {
    exprObj.default = wrap(_default);
  }
  return new Expr(exprObj);
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#miscellaneous-functions).
 *
 * @param {module:query~ExprArg} path
 *   An array representing a path to pull from an object.
 * @param {module:query~ExprArg} from
 *   The object to select from
 * @return {Expr}
 */
function SelectAll(path, from) {
  arity.exact(2, arguments);
  return new Expr({ select_all: wrap(path), from: wrap(from) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A numbers to provide the absolute value.
 * @return {Expr}
 */
function Abs(expr) {
  arity.exact(1, arguments);
  return new Expr({ abs: wrap(expr) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of numbers to sum together.
 * @return {Expr}
 */
function Add() {
  arity.min(1, arguments);
  return new Expr({ add: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of numbers to bitwise and together.
 * @return {Expr}
 */
function BitAnd() {
  arity.min(1, arguments);
  return new Expr({ bitand: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A numbers to provide the bitwise not.
 * @return {Expr}
 */
function BitNot(expr) {
  arity.exact(1, arguments);
  return new Expr({ bitnot: wrap(expr) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of numbers to bitwise Or'd together.
 * @return {Expr}
 */
function BitOr() {
  arity.min(1, arguments);
  return new Expr({ bitor: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of numbers to bitwise Xor'd together.
 * @return {Expr}
 */
function BitXor() {
  arity.min(1, arguments);
  return new Expr({ bitxor: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The least integer that is greater than or equal to the number
 * @return {Expr}
 */
function Ceil(expr) {
  arity.exact(1, arguments);
  return new Expr({ ceil: wrap(expr) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of numbers to compute the quotient of.
 * @return {Expr}
 */
function Divide() {
  arity.min(1, arguments);
  return new Expr({ divide: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The greatest integer that is less than or equal to the number
 * @return {Expr}
 */
function Floor(expr) {
  arity.exact(1, arguments);
  return new Expr({ floor: wrap(expr) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of numbers to multiply together.
 * @return {Expr}
 */
function Max() {
  arity.min(1, arguments);
  return new Expr({ max: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of numbers to multiply together.
 * @return {Expr}
 */
function Min() {
  arity.min(1, arguments);
  return new Expr({ min: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of numbers to compute the quotient of. The remainder will be returned.
 * @return {Expr}
 */
function Modulo() {
  arity.min(1, arguments);
  return new Expr({ modulo: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of numbers to multiply together.
 * @return {Expr}
 */
function Multiply() {
  arity.min(1, arguments);
  return new Expr({ multiply: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A numbers to round.
 * @param {...module:query~ExprArg} terms
 *   An optional precision
 * @return {Expr}
 */
function Round(value, precision) {
  arity.min(1, arguments);
  precision = defaults(precision, null);
  return new Expr(params({ round: wrap(value) }, { precision: wrap(precision) }));
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of numbers to compute the difference of.
 * @return {Expr}
 */
function Subtract() {
  arity.min(1, arguments);
  return new Expr({ subtract: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The sign of the number is returned as positive 1, zero 0 , negative -1
 * @return {Expr}
 */
function Sign(expr) {
  arity.exact(1, arguments);
  return new Expr({ sign: wrap(expr) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The square root of the number
 * @return {Expr}
 */
function Sqrt(expr) {
  arity.exact(1, arguments);
  return new Expr({ sqrt: wrap(expr) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A numbers to truncate.
 * @param {...module:query~ExprArg} terms
 *   An optional precision
 * @return {Expr}
 */
function Trunc(value, precision) {
  arity.min(1, arguments);
  precision = defaults(precision, null);
  return new Expr(params({ trunc: wrap(value) }, { precision: wrap(precision) }));
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The arc cosine of the number
 * @return {Expr}
 */
function Acos(expr) {
  arity.exact(1, arguments);
  return new Expr({ acos: wrap(expr) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The arc sine of the number
 * @return {Expr}
 */
function Asin(expr) {
  arity.exact(1, arguments);
  return new Expr({ asin: wrap(expr) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The arc tangent of the number
 * @return {Expr}
 */
function Atan(expr) {
  arity.exact(1, arguments);
  return new Expr({ atan: wrap(expr) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The cosine of a number
 * @return {Expr}
 */
function Cos(expr) {
  arity.exact(1, arguments);
  return new Expr({ cos: wrap(expr) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The hyperbolic cosine of the number
 * @return {Expr}
 */
function Cosh(expr) {
  arity.exact(1, arguments);
  return new Expr({ cosh: wrap(expr) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   Take radians and convert it to degrees 360 degrees = 2 * pi radians
 * @return {Expr}
 */
function Degrees(expr) {
  arity.exact(1, arguments);
  return new Expr({ degrees: wrap(expr) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The e raised to an exponent number
 * @return {Expr}
 */
function Exp(expr) {
  arity.exact(1, arguments);
  return new Expr({ exp: wrap(expr) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A side of the right triangle
 * @param {...module:query~ExprArg} terms
 *   The second side of a right triange, defaults to the first side
 * @return {Expr}
 */
function Hypot(value, side) {
  arity.min(1, arguments);
  side = defaults(side, null);
  return new Expr(params({ hypot: wrap(value) }, { b: wrap(side) }));
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The natural log of the number
 * @return {Expr}
 */
function Ln(expr) {
  arity.exact(1, arguments);
  return new Expr({ ln: wrap(expr) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The log base 10 of a number
 * @return {Expr}
 */
function Log(expr) {
  arity.exact(1, arguments);
  return new Expr({ log: wrap(expr) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A numbers to raise to the power.
 * @param {...module:query~ExprArg} terms
 *   An optional exponent
 * @return {Expr}
 */
function Pow(value, exponent) {
  arity.min(1, arguments);
  exponent = defaults(exponent, null);
  return new Expr(params({ pow: wrap(value) }, { exp: wrap(exponent) }));
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   Take degrees and convert the number to radians 2 * pi = 360 degrees
 * @return {Expr}
 */
function Radians(expr) {
  arity.exact(1, arguments);
  return new Expr({ radians: wrap(expr) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The sine of a number
 * @return {Expr}
 */
function Sin(expr) {
  arity.exact(1, arguments);
  return new Expr({ sin: wrap(expr) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The hyperbolic sine of a number
 * @return {Expr}
 */
function Sinh(expr) {
  arity.exact(1, arguments);
  return new Expr({ sinh: wrap(expr) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The Tangent of a number
 * @return {Expr}
 */
function Tan(expr) {
  arity.exact(1, arguments);
  return new Expr({ tan: wrap(expr) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#mathematical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   The hyberbolic tangent of a number
 * @return {Expr}
 */
function Tanh(expr) {
  arity.exact(1, arguments);
  return new Expr({ tanh: wrap(expr) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#logical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of terms to compare.
 * @return {Expr}
 */
function LT() {
  arity.min(1, arguments);
  return new Expr({ lt: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#logical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of terms to compare.
 * @return {Expr}
 */
function LTE() {
  arity.min(1, arguments);
  return new Expr({ lte: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#logical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of terms to compare.
 * @return {Expr}
 */
function GT() {
  arity.min(1, arguments);
  return new Expr({ gt: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#logical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection of terms to compare.
 * @return {Expr}
 */
function GTE() {
  arity.min(1, arguments);
  return new Expr({ gte: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#logical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection to compute the conjunction of.
 * @return {Expr}
 */
function And() {
  arity.min(1, arguments);
  return new Expr({ and: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#logical-functions).
 *
 * @param {...module:query~ExprArg} terms
 *   A collection to compute the disjunction of.
 * @return {Expr}
 */
function Or() {
  arity.min(1, arguments);
  return new Expr({ or: wrap(varargs(arguments)) });
}

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#logical-functions).
 *
 * @param {module:query~ExprArg} boolean
 *   A boolean to produce the negation of.
 * @return {Expr}
 */
function Not(boolean) {
  arity.exact(1, arguments);
  return new Expr({ not: wrap(boolean) });
}

/**
 * Converts an expression to a string literal.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to a string.
 * @return {Expr}
 */
function ToString(expr) {
  arity.exact(1, arguments);
  return new Expr({ to_string: wrap(expr) });
}

/**
 * Converts an expression to a number literal.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to a number.
 * @return {Expr}
 */
function ToNumber(expr) {
  arity.exact(1, arguments);
  return new Expr({ to_number: wrap(expr) });
}

/**
 * Converts an expression to a time literal.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to a time.
 * @return {Expr}
 */
function ToTime(expr) {
  arity.exact(1, arguments);
  return new Expr({ to_time: wrap(expr) });
}

/**
 * Converts an expression to a date literal.
 *
 * @param {module:query~ExprArg} expression
 *   An expression to convert to a date.
 * @return {Expr}
 */
function ToDate(expr) {
  arity.exact(1, arguments);
  return new Expr({ to_date: wrap(expr) });
}

// Helpers

/**
 * @ignore
 */
function arity(min, max, args) {
  if ((min !== null && args.length < min) || (max !== null && args.length > max)) {
    throw new errors.InvalidArity(min, max, args.length);
  }
}

arity.exact = function (n, args) { arity(n, n, args); };
arity.max = function (n, args) { arity(null, n, args); };
arity.min = function (n, args) { arity(n, null, args); };
arity.between = function (min, max, args) { arity(min, max, args); };

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
  arity.exact(1, arguments);
  if (obj === null) {
    return null;
  } else if (obj instanceof Expr) {
    return obj;
  } else if (typeof obj === 'symbol') {
    return obj.toString().replace(/Symbol\((.*)\)/, function(str, symbol) {
      return symbol;
    });
  } else if (typeof obj === 'function') {
    return Lambda(obj);
  } else if (Array.isArray(obj)) {
    return new Expr(obj.map(function (elem) {
      return wrap(elem);
    }));
  } else if (obj instanceof Uint8Array || obj instanceof ArrayBuffer) {
    return new values.Bytes(obj);
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
  Bytes: Bytes,
  Abort: Abort,
  At: At,
  Let: Let,
  Var: Var,
  If: If,
  Do: Do,
  Object: objectFunction,
  Lambda: Lambda,
  Call: Call,
  Query: Query,
  Map: Map,
  Foreach: Foreach,
  Filter: Filter,
  Take: Take,
  Drop: Drop,
  Prepend: Prepend,
  Append: Append,
  IsEmpty: IsEmpty,
  IsNonEmpty: IsNonEmpty,
  Get: Get,
  KeyFromSecret: KeyFromSecret,
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
  CreateKey: CreateKey,
  CreateFunction: CreateFunction,
  Singleton: Singleton,
  Events: Events,
  Match: Match,
  Union: Union,
  Intersection: Intersection,
  Difference: Difference,
  Distinct: Distinct,
  Join: Join,
  Login: Login,
  Logout: Logout,
  Identify: Identify,
  Identity: Identity,
  HasIdentity: HasIdentity,
  Concat: Concat,
  Casefold: Casefold,
  FindStr: FindStr,
  FindStrRegex: FindStrRegex,
  Length: Length,
  LowerCase: LowerCase,
  LTrim: LTrim,
  NGram: NGram,
  Repeat: Repeat,
  ReplaceStr: ReplaceStr,
  ReplaceStrRegex: ReplaceStrRegex,
  RTrim: RTrim,
  Space: Space,
  SubString: SubString,
  TitleCase: TitleCase,
  Trim: Trim,
  UpperCase: UpperCase,
  Time: Time,
  Epoch: Epoch,
  Date: Date,
  NextId: deprecate(NextId, 'NextId() is deprecated, use NewId() instead'),
  NewId: NewId,
  Database: Database,
  Index: Index,
  Class: Class,
  Function: FunctionFn,
  Classes: Classes,
  Databases: Databases,
  Indexes: Indexes,
  Functions: Functions,
  Keys: Keys,
  Tokens: Tokens,
  Credentials: Credentials,
  Equals: Equals,
  Contains: Contains,
  Select: Select,
  SelectAll: SelectAll,
  Abs: Abs,
  Add: Add,
  BitAnd: BitAnd,
  BitNot: BitNot,
  BitOr: BitOr,
  BitXor: BitXor,
  Ceil: Ceil,
  Divide: Divide,
  Floor: Floor,
  Max: Max,
  Min: Min,
  Modulo: Modulo,
  Multiply: Multiply,
  Round: Round,
  Subtract: Subtract,
  Sign: Sign,
  Sqrt: Sqrt,
  Trunc: Trunc,
  Acos: Acos,
  Asin: Asin,
  Atan: Atan,
  Cos: Cos,
  Cosh: Cosh,
  Degrees: Degrees,
  Exp: Exp,
  Hypot: Hypot,
  Ln: Ln,
  Log: Log,
  Pow: Pow,
  Radians: Radians,
  Sin: Sin,
  Sinh: Sinh,
  Tan: Tan,
  Tanh: Tanh,
  LT: LT,
  LTE: LTE,
  GT: GT,
  GTE: GTE,
  And: And,
  Or: Or,
  Not: Not,
  ToString: ToString,
  ToNumber: ToNumber,
  ToTime: ToTime,
  ToDate: ToDate,
  wrap: wrap
};
