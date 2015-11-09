'use strict';

var _defineProperty = require('babel-runtime/helpers/define-property')['default'];

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
exports.contains = contains;
exports.select = select;
exports.selectWithDefault = selectWithDefault;
exports.add = add;
exports.multiply = multiply;
exports.subtract = subtract;
exports.divide = divide;

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

function if_expr(condition, true_expr, false_expr) {
  return { 'if': condition, then: true_expr, 'else': false_expr };
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_form). */

function do_expr() {
  for (var _len = arguments.length, expressions = Array(_len), _key = 0; _key < _len; _key++) {
    expressions[_key] = arguments[_key];
  }

  return varargsQuery('do', expressions);
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */

function object(object) {
  return { object: object };
}

/** See the [docs](https://faunadb.com/documentation/queries#basic_forms). */

function quote(quote) {
  return { quote: quote };
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
 * @param {function} lambda_body Takes a variable and uses it to construct an expression.
 * @return {lambda_expr}
 */

function lambda(lambda_body) {
  var varName = 'auto' + lambdaAutoVarNumber;
  lambdaAutoVarNumber += 1;

  // Make sure lambdaAutoVarNumber returns to its former value even if there are errors.
  try {
    return lambda_expr(varName, lambda_body(variable(varName)));
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
 * @param {function} lambda_body
 *   Takes an object of variables taken from the leaves of `pattern`, and returns a query.
 * @return {lambda_expr}
 */

function lambda_pattern(pattern, lambda_body) {
  var vars = {};
  function collectVars(pat) {
    if (pat instanceof Array) pat.forEach(collectVars);else if (typeof pat === 'object') for (var key in pat) {
      collectVars(pat[key]);
    } else if (typeof pat === 'string') {
      if (pat !== '') vars[pat] = variable(pat);
    } else throw new _errors.InvalidQuery('Pattern must be Array, object, or string; got ' + (0, _util.inspect)(pat) + '.');
  }
  collectVars(pattern);
  return lambda_expr(pattern, lambda_body(vars));
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

function match(match, index) {
  return { match: match, index: index };
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */

function union() {
  for (var _len2 = arguments.length, sets = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    sets[_key2] = arguments[_key2];
  }

  return varargsQuery('union', sets);
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */

function intersection() {
  for (var _len3 = arguments.length, sets = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    sets[_key3] = arguments[_key3];
  }

  return varargsQuery('intersection', sets);
}

/** See the [docs](https://faunadb.com/documentation/queries#sets). */

function difference() {
  for (var _len4 = arguments.length, sets = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    sets[_key4] = arguments[_key4];
  }

  return varargsQuery('difference', sets);
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

  return varargsQuery('equals', values);
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */

function concat() {
  for (var _len6 = arguments.length, strings = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
    strings[_key6] = arguments[_key6];
  }

  return varargsQuery('concat', strings);
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */

function contains(path, value) {
  return { contains: path, 'in': value };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */

function select(path, data) {
  return { select: path, from: data };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */

function selectWithDefault(path, data, _default) {
  return { select: path, from: data, 'default': _default };
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */

function add() {
  for (var _len7 = arguments.length, numbers = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
    numbers[_key7] = arguments[_key7];
  }

  return varargsQuery('add', numbers);
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */

function multiply() {
  for (var _len8 = arguments.length, numbers = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
    numbers[_key8] = arguments[_key8];
  }

  return varargsQuery('multiply', numbers);
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */

function subtract() {
  for (var _len9 = arguments.length, numbers = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
    numbers[_key9] = arguments[_key9];
  }

  return varargsQuery('subtract', numbers);
}

/** See the [docs](https://faunadb.com/documentation/queries#misc_functions). */

function divide() {
  for (var _len10 = arguments.length, numbers = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
    numbers[_key10] = arguments[_key10];
  }

  return varargsQuery('divide', numbers);
}

function params(mainParams, optionalParams) {
  for (var key in optionalParams) {
    var val = optionalParams[key];
    if (val !== null) mainParams[key] = val;
  }
  return mainParams;
}

function varargsQuery(name, values) {
  return _defineProperty({}, name, values.length === 1 ? values[0] : values);
}
//# sourceMappingURL=data:application/json;base64,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QUFLLElBQU0sR0FBRyxJQUFJLGNBQWMsRUFBRTtBQUNoQyxRQUFNLEdBQUcsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDL0IsUUFBSSxHQUFHLEtBQUssSUFBSSxFQUNkLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7R0FDeEI7QUFDRCxTQUFPLFVBQVUsQ0FBQTtDQUNsQjs7QUFFRCxTQUFTLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFO0FBQ2xDLDZCQUFTLElBQUksRUFBRyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxFQUFDO0NBQzFEIiwiZmlsZSI6InF1ZXJ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpbnNwZWN0fSBmcm9tICd1dGlsJ1xuaW1wb3J0IHtJbnZhbGlkUXVlcnl9IGZyb20gJy4vZXJyb3JzJ1xuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjYmFzaWNfZm9ybXMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxldF9leHByKHZhcnMsIGluX2V4cHIpIHtcbiAgcmV0dXJuIHtsZXQ6IHZhcnMsIGluOiBpbl9leHByfVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjYmFzaWNfZm9ybSkuICovXG5leHBvcnQgZnVuY3Rpb24gdmFyaWFibGUodmFyTmFtZSkge1xuICByZXR1cm4ge3ZhcjogdmFyTmFtZX1cbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI2Jhc2ljX2Zvcm1zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpZl9leHByKGNvbmRpdGlvbiwgdHJ1ZV9leHByLCBmYWxzZV9leHByKSB7XG4gIHJldHVybiB7aWY6IGNvbmRpdGlvbiwgdGhlbjogdHJ1ZV9leHByLCBlbHNlOiBmYWxzZV9leHByfVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjYmFzaWNfZm9ybSkuICovXG5leHBvcnQgZnVuY3Rpb24gZG9fZXhwciguLi5leHByZXNzaW9ucykge1xuICByZXR1cm4gdmFyYXJnc1F1ZXJ5KCdkbycsIGV4cHJlc3Npb25zKVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjYmFzaWNfZm9ybXMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9iamVjdChvYmplY3QpIHtcbiAgcmV0dXJuIHtvYmplY3R9XG59XG5cbi8qKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcXVlcmllcyNiYXNpY19mb3JtcykuICovXG5leHBvcnQgZnVuY3Rpb24gcXVvdGUocXVvdGUpIHtcbiAgcmV0dXJuIHtxdW90ZX1cbn1cblxubGV0IGxhbWJkYUF1dG9WYXJOdW1iZXIgPSAwXG5cbi8qKlxuICogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjYmFzaWNfZm9ybXMpLlxuICogVGhpcyBmb3JtIGdlbmVyYXRlcyB0aGUgbmFtZXMgb2YgbGFtYmRhIHBhcmFtZXRlcnMgZm9yIHlvdSwgYW5kIGlzIGNhbGxlZCBsaWtlOlxuICpcbiAqICAgICBxdWVyeS5sYW1iZGEoYSA9PiBxdWVyeS5hZGQoYSwgYSkpXG4gKiAgICAgLy8gUHJvZHVjZXM6IHtsYW1iZGE6ICdhdXRvMCcsIGV4cHI6IHthZGQ6IFt7dmFyOiAnYXV0bzAnfSwge3ZhcjogJ2F1dG8wJ31dfX1cbiAqXG4gKiBRdWVyeSBmdW5jdGlvbnMgcmVxdWlyaW5nIGxhbWJkYXMgY2FuIGJlIHBhc3MgcmF3IGZ1bmN0aW9ucyB3aXRob3V0IGV4cGxpY2l0bHkgY2FsbGluZyBgbGFtYmRhYC5cbiAqIEZvciBleGFtcGxlOiBgcXVlcnkubWFwKGEgPT4gcXVlcnkuYWRkKGEsIDEpLCBjb2xsZWN0aW9uKWAuXG4gKlxuICogWW91IGNhbiBhbHNvIHVzZSB7QGxpbmsgbGFtYmRhX3BhdHRlcm59LCBvciB1c2Uge0BsaW5rIGxhbWJkYV9leHByfSBkaXJlY3RseS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBsYW1iZGFfYm9keSBUYWtlcyBhIHZhcmlhYmxlIGFuZCB1c2VzIGl0IHRvIGNvbnN0cnVjdCBhbiBleHByZXNzaW9uLlxuICogQHJldHVybiB7bGFtYmRhX2V4cHJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsYW1iZGEobGFtYmRhX2JvZHkpIHtcbiAgY29uc3QgdmFyTmFtZSA9IGBhdXRvJHtsYW1iZGFBdXRvVmFyTnVtYmVyfWBcbiAgbGFtYmRhQXV0b1Zhck51bWJlciArPSAxXG5cbiAgLy8gTWFrZSBzdXJlIGxhbWJkYUF1dG9WYXJOdW1iZXIgcmV0dXJucyB0byBpdHMgZm9ybWVyIHZhbHVlIGV2ZW4gaWYgdGhlcmUgYXJlIGVycm9ycy5cbiAgdHJ5IHtcbiAgICByZXR1cm4gbGFtYmRhX2V4cHIodmFyTmFtZSwgbGFtYmRhX2JvZHkodmFyaWFibGUodmFyTmFtZSkpKVxuICB9IGZpbmFsbHkge1xuICAgIGxhbWJkYUF1dG9WYXJOdW1iZXIgLT0gMVxuICB9XG59XG5cbi8qKiBJZiBgdmFsdWVgIGlzIGEgZnVuY3Rpb24gY29udmVydHMgaXQgdG8gYSBxdWVyeSB1c2luZyB7QGxpbmsgbGFtYmRhfS4gKi9cbmZ1bmN0aW9uIHRvTGFtYmRhKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIEZ1bmN0aW9uID8gbGFtYmRhKHZhbHVlKSA6IHZhbHVlXG59XG5cbi8qKlxuICogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjYmFzaWNfZm9ybXMpLlxuICogVGhpcyBmb3JtIGdhdGhlcnMgdmFyaWFibGVzIGZyb20gdGhlIHBhdHRlcm4geW91IHByb3ZpZGUgYW5kIHB1dHMgdGhlbSBpbiBhbiBvYmplY3QuXG4gKiBJdCBpcyBjYWxsZWQgbGlrZTpcbiAqXG4gKiAgICAgcSA9IHF1ZXJ5Lm1hcChcbiAqICAgICAgIHF1ZXJ5LmxhbWJkYV9wYXR0ZXJuKFsnZm9vJywgJycsICdiYXInXSwgKHtmb28sIGJhcn0pID0+IFtiYXIsIGZvb10pLFxuICogICAgICAgW1sxLCAyLCAzXSwgWzQsIDUsIDZdXSkpXG4gKiAgICAgLy8gUmVzdWx0IG9mIGNsaWVudC5xdWVyeShxKSBpczogW1szLCAxXSwgWzYsIDRdXS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fG9iamVjdH0gcGF0dGVyblxuICogICBUcmVlIG9mIEFycmF5cyBhbmQgb2JqZWN0cy4gTGVhdmVzIGFyZSB0aGUgbmFtZXMgb2YgdmFyaWFibGVzLlxuICogICBJZiBhIGxlYWYgaXMgdGhlIGVtcHR5IHN0cmluZyBgJydgLCBpdCBpcyBpZ25vcmVkLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gbGFtYmRhX2JvZHlcbiAqICAgVGFrZXMgYW4gb2JqZWN0IG9mIHZhcmlhYmxlcyB0YWtlbiBmcm9tIHRoZSBsZWF2ZXMgb2YgYHBhdHRlcm5gLCBhbmQgcmV0dXJucyBhIHF1ZXJ5LlxuICogQHJldHVybiB7bGFtYmRhX2V4cHJ9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsYW1iZGFfcGF0dGVybihwYXR0ZXJuLCBsYW1iZGFfYm9keSkge1xuICBjb25zdCB2YXJzID0ge31cbiAgZnVuY3Rpb24gY29sbGVjdFZhcnMocGF0KSB7XG4gICAgaWYgKHBhdCBpbnN0YW5jZW9mIEFycmF5KVxuICAgICAgcGF0LmZvckVhY2goY29sbGVjdFZhcnMpXG4gICAgZWxzZSBpZiAodHlwZW9mIHBhdCA9PT0gJ29iamVjdCcpXG4gICAgICBmb3IgKGNvbnN0IGtleSBpbiBwYXQpXG4gICAgICAgIGNvbGxlY3RWYXJzKHBhdFtrZXldKVxuICAgIGVsc2UgaWYgKHR5cGVvZiBwYXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAocGF0ICE9PSAnJylcbiAgICAgICAgdmFyc1twYXRdID0gdmFyaWFibGUocGF0KVxuICAgIH0gZWxzZVxuICAgICAgdGhyb3cgbmV3IEludmFsaWRRdWVyeShgUGF0dGVybiBtdXN0IGJlIEFycmF5LCBvYmplY3QsIG9yIHN0cmluZzsgZ290ICR7aW5zcGVjdChwYXQpfS5gKVxuICB9XG4gIGNvbGxlY3RWYXJzKHBhdHRlcm4pXG4gIHJldHVybiBsYW1iZGFfZXhwcihwYXR0ZXJuLCBsYW1iZGFfYm9keSh2YXJzKSlcbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI2Jhc2ljX2Zvcm1zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsYW1iZGFfZXhwcih2YXJfbmFtZSwgZXhwcikge1xuICByZXR1cm4ge2xhbWJkYTogdmFyX25hbWUsIGV4cHJ9XG59XG5cbi8qKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcXVlcmllcyNjb2xsZWN0aW9uX2Z1bmN0aW9ucykuICovXG5leHBvcnQgZnVuY3Rpb24gbWFwKGxhbWJkYV9leHByLCBjb2xsZWN0aW9uKSB7XG4gIHJldHVybiB7bWFwOiB0b0xhbWJkYShsYW1iZGFfZXhwciksIGNvbGxlY3Rpb259XG59XG5cbi8qKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcXVlcmllcyNjb2xsZWN0aW9uX2Z1bmN0aW9ucykuICovXG5leHBvcnQgZnVuY3Rpb24gZm9yZWFjaChsYW1iZGFfZXhwciwgY29sbGVjdGlvbikge1xuICByZXR1cm4ge2ZvcmVhY2g6IHRvTGFtYmRhKGxhbWJkYV9leHByKSwgY29sbGVjdGlvbn1cbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI3JlYWRfZnVuY3Rpb25zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXQocmVmLCB0cz1udWxsKSB7XG4gIHJldHVybiBwYXJhbXMoe2dldDogcmVmfSwge3RzfSlcbn1cblxuLyoqXG4gKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcXVlcmllcyNyZWFkX2Z1bmN0aW9ucykuXG4gKiBZb3UgbWF5IHdhbnQgdG8gY29udmVydCB0aGUgcmVzdWx0IG9mIHRoaXMgdG8gYSB7QGxpbmsgUGFnZX0uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYWdpbmF0ZShzZXQsIG9wdHM9e30pIHtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe3BhZ2luYXRlOiBzZXR9LCBvcHRzKVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjcmVhZF9mdW5jdGlvbnMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4aXN0cyhyZWYsIHRzPW51bGwpIHtcbiAgcmV0dXJuIHBhcmFtcyh7ZXhpc3RzOiByZWZ9LCB7dHN9KVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjcmVhZF9mdW5jdGlvbnMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvdW50KHNldCwgZXZlbnRzPW51bGwpIHtcbiAgcmV0dXJuIHBhcmFtcyh7Y291bnQ6IHNldH0sIHtldmVudHN9KVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjd3JpdGVfZnVuY3Rpb25zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoY2xhc3NfcmVmLCBwYXJhbXMpIHtcbiAgcmV0dXJuIHtjcmVhdGU6IGNsYXNzX3JlZiwgcGFyYW1zfVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjd3JpdGVfZnVuY3Rpb25zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGUocmVmLCBwYXJhbXMpIHtcbiAgcmV0dXJuIHt1cGRhdGU6IHJlZiwgcGFyYW1zfVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjd3JpdGVfZnVuY3Rpb25zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXBsYWNlKHJlZiwgcGFyYW1zKSB7XG4gIHJldHVybiB7cmVwbGFjZTogcmVmLCBwYXJhbXN9XG59XG5cbi8qKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcXVlcmllcyN3cml0ZV9mdW5jdGlvbnMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZV9leHByKHJlZikge1xuICByZXR1cm4ge2RlbGV0ZTogcmVmfVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjc2V0cykuICovXG5leHBvcnQgZnVuY3Rpb24gbWF0Y2gobWF0Y2gsIGluZGV4KSB7XG4gIHJldHVybiB7bWF0Y2gsIGluZGV4fVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjc2V0cykuICovXG5leHBvcnQgZnVuY3Rpb24gdW5pb24oLi4uc2V0cykge1xuICByZXR1cm4gdmFyYXJnc1F1ZXJ5KCd1bmlvbicsIHNldHMpXG59XG5cbi8qKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcXVlcmllcyNzZXRzKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnRlcnNlY3Rpb24oLi4uc2V0cykge1xuICByZXR1cm4gdmFyYXJnc1F1ZXJ5KCdpbnRlcnNlY3Rpb24nLCBzZXRzKVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjc2V0cykuICovXG5leHBvcnQgZnVuY3Rpb24gZGlmZmVyZW5jZSguLi5zZXRzKSB7XG4gIHJldHVybiB2YXJhcmdzUXVlcnkoJ2RpZmZlcmVuY2UnLCBzZXRzKVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjc2V0cykuICovXG5leHBvcnQgZnVuY3Rpb24gam9pbihzb3VyY2UsIHRhcmdldCkge1xuICByZXR1cm4ge2pvaW46IHNvdXJjZSwgd2l0aDogdG9MYW1iZGEodGFyZ2V0KX1cbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI21pc2NfZnVuY3Rpb25zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbHMoLi4udmFsdWVzKSB7XG4gIHJldHVybiB2YXJhcmdzUXVlcnkoJ2VxdWFscycsIHZhbHVlcylcbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI21pc2NfZnVuY3Rpb25zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25jYXQoLi4uc3RyaW5ncykge1xuICByZXR1cm4gdmFyYXJnc1F1ZXJ5KCdjb25jYXQnLCBzdHJpbmdzKVxufVxuXG4vKiogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjbWlzY19mdW5jdGlvbnMpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnRhaW5zKHBhdGgsIHZhbHVlKSB7XG4gIHJldHVybiB7Y29udGFpbnM6IHBhdGgsIGluOiB2YWx1ZX1cbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI21pc2NfZnVuY3Rpb25zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3QocGF0aCwgZGF0YSkge1xuICByZXR1cm4ge3NlbGVjdDogcGF0aCwgZnJvbTogZGF0YX1cbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI21pc2NfZnVuY3Rpb25zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RXaXRoRGVmYXVsdChwYXRoLCBkYXRhLCBfZGVmYXVsdCkge1xuICByZXR1cm4ge3NlbGVjdDogcGF0aCwgZnJvbTogZGF0YSwgZGVmYXVsdDogX2RlZmF1bHR9XG59XG5cbi8qKiBTZWUgdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcXVlcmllcyNtaXNjX2Z1bmN0aW9ucykuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkKC4uLm51bWJlcnMpIHtcbiAgcmV0dXJuIHZhcmFyZ3NRdWVyeSgnYWRkJywgbnVtYmVycylcbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI21pc2NfZnVuY3Rpb25zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseSguLi5udW1iZXJzKSB7XG4gIHJldHVybiB2YXJhcmdzUXVlcnkoJ211bHRpcGx5JywgbnVtYmVycylcbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI21pc2NfZnVuY3Rpb25zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdCguLi5udW1iZXJzKSB7XG4gIHJldHVybiB2YXJhcmdzUXVlcnkoJ3N1YnRyYWN0JywgbnVtYmVycylcbn1cblxuLyoqIFNlZSB0aGUgW2RvY3NdKGh0dHBzOi8vZmF1bmFkYi5jb20vZG9jdW1lbnRhdGlvbi9xdWVyaWVzI21pc2NfZnVuY3Rpb25zKS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXZpZGUoLi4ubnVtYmVycykge1xuICByZXR1cm4gdmFyYXJnc1F1ZXJ5KCdkaXZpZGUnLCBudW1iZXJzKVxufVxuXG5mdW5jdGlvbiBwYXJhbXMobWFpblBhcmFtcywgb3B0aW9uYWxQYXJhbXMpIHtcbiAgZm9yIChjb25zdCBrZXkgaW4gb3B0aW9uYWxQYXJhbXMpIHtcbiAgICBjb25zdCB2YWwgPSBvcHRpb25hbFBhcmFtc1trZXldXG4gICAgaWYgKHZhbCAhPT0gbnVsbClcbiAgICAgIG1haW5QYXJhbXNba2V5XSA9IHZhbFxuICB9XG4gIHJldHVybiBtYWluUGFyYW1zXG59XG5cbmZ1bmN0aW9uIHZhcmFyZ3NRdWVyeShuYW1lLCB2YWx1ZXMpIHtcbiAgcmV0dXJuIHtbbmFtZV06IHZhbHVlcy5sZW5ndGggPT09IDEgPyB2YWx1ZXNbMF0gOiB2YWx1ZXN9XG59XG4iXX0=