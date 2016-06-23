import Expr from "./Expr";

type ExprVal = (Expr|string|number|boolean|Object);
type ExprArg = (ExprVal|Array<ExprVal>);
export type Lambda = (...vars: any[]) => Expr;

export module query {
  export function let_expr(vars: ExprArg, in_expr: ExprArg): Expr;
  export function variable(varName: ExprArg): Expr;
  export function if_expr(condition: ExprArg, then: ExprArg, _else: ExprArg): Expr;
  export function do_expr(...args: ExprArg[]): Expr;
  export function object(fields: ExprArg): Expr;
  export function lambda(f: Lambda): Expr;
  export function lambda_expr(var_name: ExprArg, expr: ExprArg): Expr;
  export function map(collection: ExprArg, lambda_expr: Lambda): Expr;
  export function foreach(collection: ExprArg, lambda_expr: Lambda): Expr;
  export function filter(collection: ExprArg, lambda_expr: Lambda): Expr;
  export function take(number: ExprArg, collection: ExprArg): Expr;
  export function drop(number: ExprArg, collection: ExprArg): Expr;
  export function prepend(elements: ExprArg, collection: ExprArg): Expr;
  export function append(elements: ExprArg, collection: ExprArg): Expr;

  export function get(ref: ExprArg, ts?: ExprArg): Expr;
  export function paginate(set: ExprArg, opts?: Object): Expr;
  export function exists(ref: ExprArg, ts?: ExprArg): Expr;
  export function count(set: ExprArg, events?: ExprArg): Expr;

  export function create(class_ref: ExprArg, params?: ExprArg): Expr;
  export function update(ref: ExprArg, params: ExprArg): Expr;
  export function replace(ref: ExprArg, params: ExprArg): Expr;
  export function delete_expr(ref: ExprArg): Expr;
  export function insert(ref: ExprArg, ts: ExprArg, action: ExprArg, params: ExprArg): Expr;
  export function remove(ref: ExprArg, ts: ExprArg, action: ExprArg): Expr;

  export function match(index: ExprArg, ...terms: ExprArg[]): Expr;
  export function union(...sets: ExprArg[]): Expr;
  export function intersection(...sets: ExprArg[]): Expr;
  export function difference(...sets: ExprArg[]): Expr;
  export function distinct(set: ExprArg): Expr;
  export function join(source: ExprArg, target: ExprArg): Expr;

  export function login(ref: ExprArg, params: ExprArg): Expr;
  export function logout(delete_tokens: ExprArg): Expr;
  export function identify(ref: ExprArg, password: ExprArg): Expr;

  export function concat(strings: ExprArg, separator?: ExprArg): Expr;
  export function casefold(string: ExprArg): Expr;

  export function time(string: ExprArg): Expr;
  export function epoch(number: ExprArg, unit: ExprArg): Expr;
  export function date(string: ExprArg): Expr;

  export function next_id(): Expr;
  export function equals(...args: ExprArg[]): Expr;
  export function contains(path: ExprArg, _in: ExprArg): Expr;
  export function select(path: ExprArg, from: ExprArg): Expr;
  export function selectWithDefault(path: ExprArg, from: ExprArg, _default: ExprArg): Expr;
  export function add(...args: ExprArg[]): Expr;
  export function multiply(...args: ExprArg[]): Expr;
  export function subtract(...args: ExprArg[]): Expr;
  export function divide(...args: ExprArg[]): Expr;
  export function modulo(...args: ExprArg[]): Expr;
  export function lt(...args: ExprArg[]): Expr;
  export function lte(...args: ExprArg[]): Expr;
  export function gt(...args: ExprArg[]): Expr;
  export function gte(...args: ExprArg[]): Expr;
  export function and(...args: ExprArg[]): Expr;
  export function or(...args: ExprArg[]): Expr;
  export function not(bool: ExprArg): Expr;
}
