'use strict';

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.let_expr = let_expr;
exports.variable = variable;
exports.if_expr = if_expr;
exports.do_expr = do_expr;
exports.object = object;
exports.quote = quote;
exports.lambda = lambda;
exports.lambda_pattern = lambda_pattern;
exports.lambda_expr = lambda_expr;
exports.map = map;
exports.foreach = foreach;
exports.filter = filter;
exports.take = take;
exports.drop = drop;
exports.prepend = prepend;
exports.append = append;
exports.get = get;
exports.paginate = paginate;
exports.exists = exists;
exports.count = count;
exports.create = create;
exports.update = update;
exports.replace = replace;
exports.delete_expr = delete_expr;
exports.match = match;
exports.union = union;
exports.intersection = intersection;
exports.difference = difference;
exports.join = join;
exports.equals = equals;
exports.concat = concat;
exports.concatWithSeparator = concatWithSeparator;
exports.contains = contains;
exports.select = select;
exports.selectWithDefault = selectWithDefault;
exports.add = add;
exports.multiply = multiply;
exports.subtract = subtract;
exports.divide = divide;
exports.modulo = modulo;
exports.and = and;
exports.or = or;
exports.not = not;

var _util = require('util');

var _errors = require('./errors');

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */

function let_expr(vars, in_expr) {
  return { 'let': vars, 'in': in_expr };
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_form). */

function variable(varName) {
  return { 'var': varName };
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */

function if_expr(condition, then, _else) {
  return { 'if': condition, then: then, 'else': _else };
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_form). */

function do_expr() {
  for (var _len = arguments.length, expressions = Array(_len), _key = 0; _key < _len; _key++) {
    expressions[_key] = arguments[_key];
  }

  return { 'do': varargs(expressions) };
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */

function object(fields) {
  return { object: fields };
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */

function quote(expr) {
  return { quote: expr };
}

var lambdaAutoVarNumber = 0;

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
 * You can also use {@link lambda_pattern}, or use {@link lambda_expr} directly.
 *
 * @param {function} func Takes a variable and uses it to construct an expression.
 * @return {lambda_expr}
 */

function lambda(func) {
  var varName = 'auto' + lambdaAutoVarNumber;
  lambdaAutoVarNumber += 1;

  // Make sure lambdaAutoVarNumber returns to its former value even if there are errors.
  try {
    return lambda_expr(varName, func(variable(varName)));
  } finally {
    lambdaAutoVarNumber -= 1;
  }
}

/** If `value` is a function converts it to a query using {@link lambda}. */
function toLambda(value) {
  return value instanceof Function ? lambda(value) : value;
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

function lambda_pattern(pattern, func) {
  var vars = {};
  function collectVars(pat) {
    if (pat instanceof Array) pat.forEach(collectVars);else if (typeof pat === 'object') for (var key in pat) {
      collectVars(pat[key]);
    } else if (typeof pat === 'string') {
      if (pat !== '') vars[pat] = variable(pat);
    } else throw new _errors.InvalidQuery('Pattern must be Array, object, or string; got ' + (0, _util.inspect)(pat) + '.');
  }
  collectVars(pattern);
  return lambda_expr(pattern, func(vars));
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */

function lambda_expr(var_name, expr) {
  return { lambda: var_name, expr: expr };
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */

function map(lambda_expr, collection) {
  return { map: toLambda(lambda_expr), collection: collection };
}

/** See the [docs](https://faunadb.com/documentation/queries#collection_functions). */

function foreach(lambda_expr, collection) {
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

/** See the [docs](https://faunadb.com/documentation/queries#read_functions). */

function get(ref) {
  var ts = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  return params({ get: ref }, { ts: ts });
}

/**
 * See the [docs](https://faunadb.com/documentation/queries#read_functions).
 * You may want to convert the result of this to a {@link Page}.
 */

function paginate(set) {
  var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return _Object$assign({ paginate: set }, opts);
}

/** See the [docs](https://faunadb.com/documentation/queries#read_functions). */

function exists(ref) {
  var ts = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  return params({ exists: ref }, { ts: ts });
}

/** See the [docs](https://faunadb.com/documentation/queries#read_functions). */

function count(set) {
  var events = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

  return params({ count: set }, { events: events });
}

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
  return { 'delete': ref };
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */

function match(terms, index) {
  return { match: terms, index: index };
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */

function union() {
  for (var _len2 = arguments.length, sets = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    sets[_key2] = arguments[_key2];
  }

  return { union: varargs(sets) };
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */

function intersection() {
  for (var _len3 = arguments.length, sets = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    sets[_key3] = arguments[_key3];
  }

  return { intersection: varargs(sets) };
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */

function difference() {
  for (var _len4 = arguments.length, sets = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    sets[_key4] = arguments[_key4];
  }

  return { difference: varargs(sets) };
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */

function join(source, target) {
  return { join: source, 'with': toLambda(target) };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */

function equals() {
  for (var _len5 = arguments.length, values = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    values[_key5] = arguments[_key5];
  }

  return { equals: varargs(values) };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */

function concat() {
  for (var _len6 = arguments.length, strings = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
    strings[_key6] = arguments[_key6];
  }

  return { concat: varargs(strings) };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */

function concatWithSeparator(separator) {
  for (var _len7 = arguments.length, strings = Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {
    strings[_key7 - 1] = arguments[_key7];
  }

  return { concat: varargs(strings), separator: separator };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */

function contains(path, _in) {
  return { contains: path, 'in': _in };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */

function select(path, from) {
  return { select: path, from: from };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */

function selectWithDefault(path, from, _default) {
  return { select: path, from: from, 'default': _default };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */

function add() {
  for (var _len8 = arguments.length, numbers = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
    numbers[_key8] = arguments[_key8];
  }

  return { add: varargs(numbers) };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */

function multiply() {
  for (var _len9 = arguments.length, numbers = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
    numbers[_key9] = arguments[_key9];
  }

  return { multiply: varargs(numbers) };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */

function subtract() {
  for (var _len10 = arguments.length, numbers = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
    numbers[_key10] = arguments[_key10];
  }

  return { subtract: varargs(numbers) };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */

function divide() {
  for (var _len11 = arguments.length, numbers = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
    numbers[_key11] = arguments[_key11];
  }

  return { divide: varargs(numbers) };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */

function modulo() {
  for (var _len12 = arguments.length, numbers = Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
    numbers[_key12] = arguments[_key12];
  }

  return { modulo: varargs(numbers) };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */

function and() {
  for (var _len13 = arguments.length, booleans = Array(_len13), _key13 = 0; _key13 < _len13; _key13++) {
    booleans[_key13] = arguments[_key13];
  }

  return { and: varargs(booleans) };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */

function or() {
  for (var _len14 = arguments.length, booleans = Array(_len14), _key14 = 0; _key14 < _len14; _key14++) {
    booleans[_key14] = arguments[_key14];
  }

  return { or: varargs(booleans) };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */

function not(boolean) {
  return { not: boolean };
}

/** Adds optional parameters to the query. */
function params(mainParams, optionalParams) {
  for (var key in optionalParams) {
    var val = optionalParams[key];
    if (val !== null) mainParams[key] = val;
  }
  return mainParams;
}

/**
 * Called on rest arguments.
 * This ensures that a single value passed is not put in an array, so
 * `query.add([1, 2])` will work as well as `query.add(1, 2)`.
 */
function varargs(values) {
  return values.length === 1 ? values[0] : values;
}
//# sourceMappingURL=data:application/json;base64,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O0FBQVIsWUFBUTs7O0FBQzdCLFNBQU8sRUFBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFDLENBQUE7Q0FDaEM7Ozs7QUFHTSxTQUFTLEVBQUUsR0FBYztzQ0FBVixRQUFRO0FBQVIsWUFBUTs7O0FBQzVCLFNBQU8sRUFBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFDLENBQUE7Q0FDL0I7Ozs7QUFHTSxTQUFTLEdBQUcsQ0FBQyxPQUFPLEVBQUU7QUFDM0IsU0FBTyxFQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUMsQ0FBQTtDQUN0Qjs7O0FBR0QsU0FBUyxNQUFNLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRTtBQUMxQyxPQUFLLElBQU0sR0FBRyxJQUFJLGNBQWMsRUFBRTtBQUNoQyxRQUFNLEdBQUcsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDL0IsUUFBSSxHQUFHLEtBQUssSUFBSSxFQUNkLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7R0FDeEI7QUFDRCxTQUFPLFVBQVUsQ0FBQTtDQUNsQjs7Ozs7OztBQU9ELFNBQVMsT0FBTyxDQUFDLE1BQU0sRUFBRTtBQUN2QixTQUFPLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUE7Q0FDaEQiLCJmaWxlIjoicXVlcnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2luc3BlY3R9IGZyb20gJ3V0aWwnXG5pbXBvcnQge0ludmFsaWRRdWVyeX0gZnJvbSAnLi9lcnJvcnMnXG5cbi8qKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcXVlcmllcyNiYXNpY19mb3JtcykuICovXG5leHBvcnQgZnVuY3Rpb24gbGV0X2V4cHIodmFycywgaW5fZXhwcikge1xuICByZXR1cm4ge2xldDogdmFycywgaW46IGluX2V4cHJ9XG59XG5cbi8qKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcXVlcmllcyNiYXNpY19mb3JtKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YXJpYWJsZSh2YXJOYW1lKSB7XG4gIHJldHVybiB7dmFyOiB2YXJOYW1lfVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjYmFzaWNfZm9ybXMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlmX2V4cHIoY29uZGl0aW9uLCB0aGVuLCBfZWxzZSkge1xuICByZXR1cm4ge2lmOiBjb25kaXRpb24sIHRoZW4sIGVsc2U6IF9lbHNlfVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjYmFzaWNfZm9ybSkuICovXG5leHBvcnQgZnVuY3Rpb24gZG9fZXhwciguLi5leHByZXNzaW9ucykge1xuICByZXR1cm4ge2RvOiB2YXJhcmdzKGV4cHJlc3Npb25zKX1cbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI2Jhc2ljX2Zvcm1zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvYmplY3QoZmllbGRzKSB7XG4gIHJldHVybiB7b2JqZWN0OiBmaWVsZHN9XG59XG5cbi8qKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcXVlcmllcyNiYXNpY19mb3JtcykuICovXG5leHBvcnQgZnVuY3Rpb24gcXVvdGUoZXhwcikge1xuICByZXR1cm4ge3F1b3RlOiBleHByfVxufVxuXG5sZXQgbGFtYmRhQXV0b1Zhck51bWJlciA9IDBcblxuLyoqXG4gKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcXVlcmllcyNiYXNpY19mb3JtcykuXG4gKiBUaGlzIGZvcm0gZ2VuZXJhdGVzIHRoZSBuYW1lcyBvZiBsYW1iZGEgcGFyYW1ldGVycyBmb3IgeW91LCBhbmQgaXMgY2FsbGVkIGxpa2U6XG4gKlxuICogICAgIHF1ZXJ5LmxhbWJkYShhID0+IHF1ZXJ5LmFkZChhLCBhKSlcbiAqICAgICAvLyBQcm9kdWNlczoge2xhbWJkYTogJ2F1dG8wJywgZXhwcjoge2FkZDogW3t2YXI6ICdhdXRvMCd9LCB7dmFyOiAnYXV0bzAnfV19fVxuICpcbiAqIFF1ZXJ5IGZ1bmN0aW9ucyByZXF1aXJpbmcgbGFtYmRhcyBjYW4gYmUgcGFzcyByYXcgZnVuY3Rpb25zIHdpdGhvdXQgZXhwbGljaXRseSBjYWxsaW5nIGBsYW1iZGFgLlxuICogRm9yIGV4YW1wbGU6IGBxdWVyeS5tYXAoYSA9PiBxdWVyeS5hZGQoYSwgMSksIGNvbGxlY3Rpb24pYC5cbiAqXG4gKiBZb3UgY2FuIGFsc28gdXNlIHtAbGluayBsYW1iZGFfcGF0dGVybn0sIG9yIHVzZSB7QGxpbmsgbGFtYmRhX2V4cHJ9IGRpcmVjdGx5LlxuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGZ1bmMgVGFrZXMgYSB2YXJpYWJsZSBhbmQgdXNlcyBpdCB0byBjb25zdHJ1Y3QgYW4gZXhwcmVzc2lvbi5cbiAqIEByZXR1cm4ge2xhbWJkYV9leHByfVxuICovXG5leHBvcnQgZnVuY3Rpb24gbGFtYmRhKGZ1bmMpIHtcbiAgY29uc3QgdmFyTmFtZSA9IGBhdXRvJHtsYW1iZGFBdXRvVmFyTnVtYmVyfWBcbiAgbGFtYmRhQXV0b1Zhck51bWJlciArPSAxXG5cbiAgLy8gTWFrZSBzdXJlIGxhbWJkYUF1dG9WYXJOdW1iZXIgcmV0dXJucyB0byBpdHMgZm9ybWVyIHZhbHVlIGV2ZW4gaWYgdGhlcmUgYXJlIGVycm9ycy5cbiAgdHJ5IHtcbiAgICByZXR1cm4gbGFtYmRhX2V4cHIodmFyTmFtZSwgZnVuYyh2YXJpYWJsZSh2YXJOYW1lKSkpXG4gIH0gZmluYWxseSB7XG4gICAgbGFtYmRhQXV0b1Zhck51bWJlciAtPSAxXG4gIH1cbn1cblxuLyoqIElmIGB2YWx1ZWAgaXMgYSBmdW5jdGlvbiBjb252ZXJ0cyBpdCB0byBhIHF1ZXJ5IHVzaW5nIHtAbGluayBsYW1iZGF9LiAqL1xuZnVuY3Rpb24gdG9MYW1iZGEodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgRnVuY3Rpb24gPyBsYW1iZGEodmFsdWUpIDogdmFsdWVcbn1cblxuLyoqXG4gKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcXVlcmllcyNiYXNpY19mb3JtcykuXG4gKiBUaGlzIGZvcm0gZ2F0aGVycyB2YXJpYWJsZXMgZnJvbSB0aGUgcGF0dGVybiB5b3UgcHJvdmlkZSBhbmQgcHV0cyB0aGVtIGluIGFuIG9iamVjdC5cbiAqIEl0IGlzIGNhbGxlZCBsaWtlOlxuICpcbiAqICAgICBxID0gcXVlcnkubWFwKFxuICogICAgICAgcXVlcnkubGFtYmRhX3BhdHRlcm4oWydmb28nLCAnJywgJ2JhciddLCAoe2ZvbywgYmFyfSkgPT4gW2JhciwgZm9vXSksXG4gKiAgICAgICBbWzEsIDIsIDNdLCBbNCwgNSwgNl1dKSlcbiAqICAgICAvLyBSZXN1bHQgb2YgY2xpZW50LnF1ZXJ5KHEpIGlzOiBbWzMsIDFdLCBbNiwgNF1dLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl8b2JqZWN0fSBwYXR0ZXJuXG4gKiAgIFRyZWUgb2YgQXJyYXlzIGFuZCBvYmplY3RzLiBMZWF2ZXMgYXJlIHRoZSBuYW1lcyBvZiB2YXJpYWJsZXMuXG4gKiAgIElmIGEgbGVhZiBpcyB0aGUgZW1wdHkgc3RyaW5nIGAnJ2AsIGl0IGlzIGlnbm9yZWQuXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBmdW5jXG4gKiAgIFRha2VzIGFuIG9iamVjdCBvZiB2YXJpYWJsZXMgdGFrZW4gZnJvbSB0aGUgbGVhdmVzIG9mIGBwYXR0ZXJuYCwgYW5kIHJldHVybnMgYSBxdWVyeS5cbiAqIEByZXR1cm4ge2xhbWJkYV9leHByfVxuICovXG5leHBvcnQgZnVuY3Rpb24gbGFtYmRhX3BhdHRlcm4ocGF0dGVybiwgZnVuYykge1xuICBjb25zdCB2YXJzID0ge31cbiAgZnVuY3Rpb24gY29sbGVjdFZhcnMocGF0KSB7XG4gICAgaWYgKHBhdCBpbnN0YW5jZW9mIEFycmF5KVxuICAgICAgcGF0LmZvckVhY2goY29sbGVjdFZhcnMpXG4gICAgZWxzZSBpZiAodHlwZW9mIHBhdCA9PT0gJ29iamVjdCcpXG4gICAgICBmb3IgKGNvbnN0IGtleSBpbiBwYXQpXG4gICAgICAgIGNvbGxlY3RWYXJzKHBhdFtrZXldKVxuICAgIGVsc2UgaWYgKHR5cGVvZiBwYXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAocGF0ICE9PSAnJylcbiAgICAgICAgdmFyc1twYXRdID0gdmFyaWFibGUocGF0KVxuICAgIH0gZWxzZVxuICAgICAgdGhyb3cgbmV3IEludmFsaWRRdWVyeShgUGF0dGVybiBtdXN0IGJlIEFycmF5LCBvYmplY3QsIG9yIHN0cmluZzsgZ290ICR7aW5zcGVjdChwYXQpfS5gKVxuICB9XG4gIGNvbGxlY3RWYXJzKHBhdHRlcm4pXG4gIHJldHVybiBsYW1iZGFfZXhwcihwYXR0ZXJuLCBmdW5jKHZhcnMpKVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjYmFzaWNfZm9ybXMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxhbWJkYV9leHByKHZhcl9uYW1lLCBleHByKSB7XG4gIHJldHVybiB7bGFtYmRhOiB2YXJfbmFtZSwgZXhwcn1cbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI2NvbGxlY3Rpb25fZnVuY3Rpb25zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXAobGFtYmRhX2V4cHIsIGNvbGxlY3Rpb24pIHtcbiAgcmV0dXJuIHttYXA6IHRvTGFtYmRhKGxhbWJkYV9leHByKSwgY29sbGVjdGlvbn1cbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI2NvbGxlY3Rpb25fZnVuY3Rpb25zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JlYWNoKGxhbWJkYV9leHByLCBjb2xsZWN0aW9uKSB7XG4gIHJldHVybiB7Zm9yZWFjaDogdG9MYW1iZGEobGFtYmRhX2V4cHIpLCBjb2xsZWN0aW9ufVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjY29sbGVjdGlvbl9mdW5jdGlvbnMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlcihjb2xsZWN0aW9uLCBsYW1iZGFfZXhwcikge1xuICByZXR1cm4ge2ZpbHRlcjogdG9MYW1iZGEobGFtYmRhX2V4cHIpLCBjb2xsZWN0aW9ufVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjY29sbGVjdGlvbl9mdW5jdGlvbnMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRha2UobnVtYmVyLCBjb2xsZWN0aW9uKSB7XG4gIHJldHVybiB7dGFrZTogbnVtYmVyLCBjb2xsZWN0aW9ufVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjY29sbGVjdGlvbl9mdW5jdGlvbnMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRyb3AobnVtYmVyLCBjb2xsZWN0aW9uKSB7XG4gIHJldHVybiB7ZHJvcDogbnVtYmVyLCBjb2xsZWN0aW9ufVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJlcGVuZChlbGVtZW50cywgY29sbGVjdGlvbikge1xuICByZXR1cm4ge3ByZXBlbmQ6IGVsZW1lbnRzLCBjb2xsZWN0aW9ufVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjY29sbGVjdGlvbl9mdW5jdGlvbnMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFwcGVuZChlbGVtZW50cywgY29sbGVjdGlvbikge1xuICByZXR1cm4ge2FwcGVuZDogZWxlbWVudHMsIGNvbGxlY3Rpb259XG59XG5cbi8qKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcXVlcmllcyNyZWFkX2Z1bmN0aW9ucykuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0KHJlZiwgdHM9bnVsbCkge1xuICByZXR1cm4gcGFyYW1zKHtnZXQ6IHJlZn0sIHt0c30pXG59XG5cbi8qKlxuICogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjcmVhZF9mdW5jdGlvbnMpLlxuICogWW91IG1heSB3YW50IHRvIGNvbnZlcnQgdGhlIHJlc3VsdCBvZiB0aGlzIHRvIGEge0BsaW5rIFBhZ2V9LlxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFnaW5hdGUoc2V0LCBvcHRzPXt9KSB7XG4gIHJldHVybiBPYmplY3QuYXNzaWduKHtwYWdpbmF0ZTogc2V0fSwgb3B0cylcbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI3JlYWRfZnVuY3Rpb25zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGlzdHMocmVmLCB0cz1udWxsKSB7XG4gIHJldHVybiBwYXJhbXMoe2V4aXN0czogcmVmfSwge3RzfSlcbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI3JlYWRfZnVuY3Rpb25zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3VudChzZXQsIGV2ZW50cz1udWxsKSB7XG4gIHJldHVybiBwYXJhbXMoe2NvdW50OiBzZXR9LCB7ZXZlbnRzfSlcbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI3dyaXRlX2Z1bmN0aW9ucykuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKGNsYXNzX3JlZiwgcGFyYW1zKSB7XG4gIHJldHVybiB7Y3JlYXRlOiBjbGFzc19yZWYsIHBhcmFtc31cbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI3dyaXRlX2Z1bmN0aW9ucykuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlKHJlZiwgcGFyYW1zKSB7XG4gIHJldHVybiB7dXBkYXRlOiByZWYsIHBhcmFtc31cbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI3dyaXRlX2Z1bmN0aW9ucykuICovXG5leHBvcnQgZnVuY3Rpb24gcmVwbGFjZShyZWYsIHBhcmFtcykge1xuICByZXR1cm4ge3JlcGxhY2U6IHJlZiwgcGFyYW1zfVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjd3JpdGVfZnVuY3Rpb25zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWxldGVfZXhwcihyZWYpIHtcbiAgcmV0dXJuIHtkZWxldGU6IHJlZn1cbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI3NldHMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hdGNoKHRlcm1zLCBpbmRleCkge1xuICByZXR1cm4ge21hdGNoOiB0ZXJtcywgaW5kZXh9XG59XG5cbi8qKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcXVlcmllcyNzZXRzKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bmlvbiguLi5zZXRzKSB7XG4gIHJldHVybiB7dW5pb246IHZhcmFyZ3Moc2V0cyl9XG59XG5cbi8qKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcXVlcmllcyNzZXRzKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnRlcnNlY3Rpb24oLi4uc2V0cykge1xuICByZXR1cm4ge2ludGVyc2VjdGlvbjogdmFyYXJncyhzZXRzKX1cbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI3NldHMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpZmZlcmVuY2UoLi4uc2V0cykge1xuICByZXR1cm4ge2RpZmZlcmVuY2U6IHZhcmFyZ3Moc2V0cyl9XG59XG5cbi8qKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcXVlcmllcyNzZXRzKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBqb2luKHNvdXJjZSwgdGFyZ2V0KSB7XG4gIHJldHVybiB7am9pbjogc291cmNlLCB3aXRoOiB0b0xhbWJkYSh0YXJnZXQpfVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjbWlzY19mdW5jdGlvbnMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVxdWFscyguLi52YWx1ZXMpIHtcbiAgcmV0dXJuIHtlcXVhbHM6IHZhcmFyZ3ModmFsdWVzKX1cbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI21pc2NfZnVuY3Rpb25zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25jYXQoLi4uc3RyaW5ncykge1xuICByZXR1cm4ge2NvbmNhdDogdmFyYXJncyhzdHJpbmdzKX1cbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI21pc2NfZnVuY3Rpb25zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25jYXRXaXRoU2VwYXJhdG9yKHNlcGFyYXRvciwgLi4uc3RyaW5ncykge1xuICByZXR1cm4ge2NvbmNhdDogdmFyYXJncyhzdHJpbmdzKSwgc2VwYXJhdG9yfVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjbWlzY19mdW5jdGlvbnMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnRhaW5zKHBhdGgsIF9pbikge1xuICByZXR1cm4ge2NvbnRhaW5zOiBwYXRoLCBpbjogX2lufVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjbWlzY19mdW5jdGlvbnMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdChwYXRoLCBmcm9tKSB7XG4gIHJldHVybiB7c2VsZWN0OiBwYXRoLCBmcm9tfVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjbWlzY19mdW5jdGlvbnMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdFdpdGhEZWZhdWx0KHBhdGgsIGZyb20sIF9kZWZhdWx0KSB7XG4gIHJldHVybiB7c2VsZWN0OiBwYXRoLCBmcm9tOiBmcm9tLCBkZWZhdWx0OiBfZGVmYXVsdH1cbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI21pc2NfZnVuY3Rpb25zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGQoLi4ubnVtYmVycykge1xuICByZXR1cm4ge2FkZDogdmFyYXJncyhudW1iZXJzKX1cbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI21pc2NfZnVuY3Rpb25zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseSguLi5udW1iZXJzKSB7XG4gIHJldHVybiB7bXVsdGlwbHk6IHZhcmFyZ3MobnVtYmVycyl9XG59XG5cbi8qKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcXVlcmllcyNtaXNjX2Z1bmN0aW9ucykuICovXG5leHBvcnQgZnVuY3Rpb24gc3VidHJhY3QoLi4ubnVtYmVycykge1xuICByZXR1cm4ge3N1YnRyYWN0OiB2YXJhcmdzKG51bWJlcnMpfVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjbWlzY19mdW5jdGlvbnMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpdmlkZSguLi5udW1iZXJzKSB7XG4gIHJldHVybiB7ZGl2aWRlOiB2YXJhcmdzKG51bWJlcnMpfVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjbWlzY19mdW5jdGlvbnMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1vZHVsbyguLi5udW1iZXJzKSB7XG4gIHJldHVybiB7bW9kdWxvOiB2YXJhcmdzKG51bWJlcnMpfVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjbWlzY19mdW5jdGlvbnMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuZCguLi5ib29sZWFucykge1xuICByZXR1cm4ge2FuZDogdmFyYXJncyhib29sZWFucyl9XG59XG5cbi8qKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcXVlcmllcyNtaXNjX2Z1bmN0aW9ucykuICovXG5leHBvcnQgZnVuY3Rpb24gb3IoLi4uYm9vbGVhbnMpIHtcbiAgcmV0dXJuIHtvcjogdmFyYXJncyhib29sZWFucyl9XG59XG5cbi8qKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcXVlcmllcyNtaXNjX2Z1bmN0aW9ucykuICovXG5leHBvcnQgZnVuY3Rpb24gbm90KGJvb2xlYW4pIHtcbiAgcmV0dXJuIHtub3Q6IGJvb2xlYW59XG59XG5cbi8qKiBBZGRzIG9wdGlvbmFsIHBhcmFtZXRlcnMgdG8gdGhlIHF1ZXJ5LiAqL1xuZnVuY3Rpb24gcGFyYW1zKG1haW5QYXJhbXMsIG9wdGlvbmFsUGFyYW1zKSB7XG4gIGZvciAoY29uc3Qga2V5IGluIG9wdGlvbmFsUGFyYW1zKSB7XG4gICAgY29uc3QgdmFsID0gb3B0aW9uYWxQYXJhbXNba2V5XVxuICAgIGlmICh2YWwgIT09IG51bGwpXG4gICAgICBtYWluUGFyYW1zW2tleV0gPSB2YWxcbiAgfVxuICByZXR1cm4gbWFpblBhcmFtc1xufVxuXG4vKipcbiAqIENhbGxlZCBvbiByZXN0IGFyZ3VtZW50cy5cbiAqIFRoaXMgZW5zdXJlcyB0aGF0IGEgc2luZ2xlIHZhbHVlIHBhc3NlZCBpcyBub3QgcHV0IGluIGFuIGFycmF5LCBzb1xuICogYHF1ZXJ5LmFkZChbMSwgMl0pYCB3aWxsIHdvcmsgYXMgd2VsbCBhcyBgcXVlcnkuYWRkKDEsIDIpYC5cbiAqL1xuZnVuY3Rpb24gdmFyYXJncyh2YWx1ZXMpIHtcbiAgcmV0dXJuIHZhbHVlcy5sZW5ndGggPT09IDEgPyB2YWx1ZXNbMF0gOiB2YWx1ZXNcbn1cbiJdfQ==