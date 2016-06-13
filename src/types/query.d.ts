import {Expr} from "./Expr";

export type Lambda = (...vars: any[]) => Expr;

export function let_expr(vars: any, in_expr: any): Expr;
export function variable(varName: any): Expr;
export function if_expr(condition: any, then: any, _else: any): Expr;
export function do_expr(...args: any[]): Expr;
export function object(fields: any): Expr;
export function lambda(f: Lambda): Expr;
export function lambda_expr(var_name: any, expr: any): Expr;
export function map(collection: any, lambda_expr: Lambda): Expr;
export function foreach(collection: any, lambda_expr: Lambda): Expr;
export function filter(collection: any, lambda_expr: Lambda): Expr;
export function take(number: any, collection: any): Expr;
export function drop(number: any, collection: any): Expr;
export function prepend(elements: any, collection: any): Expr;
export function append(elements: any, collection: any): Expr;

export function get(ref: any, ts: any): Expr;
export function paginate(set: any, opts: Object): Expr;
export function exists(ref: any, ts: any): Expr;
export function count(set: any, events: any): Expr;

export function create(class_ref: any, params: any): Expr;
export function update(ref: any, params: any): Expr;
export function replace(ref: any, params: any): Expr;
export function delete_expr(ref: any): Expr;
export function insert(ref: any, ts: any, action: any, params: any): Expr;
export function remove(ref: any, ts: any, action: any): Expr;

export function match(index: any): Expr;
export function union(...sets: any[]): Expr;
export function intersection(...sets: any[]): Expr;
export function difference(...sets: any[]): Expr;
export function distinct(set: any): Expr;
export function join(source: any, target: any): Expr;

export function login(ref: any, params: any): Expr;
export function logout(delete_tokens: any): Expr;
export function identify(ref: any, password: any): Expr;

export function concat(strings: any, separator: any): Expr;
export function casefold(string: any): Expr;

export function time(string: any): Expr;
export function epoch(number: any, unit: any): Expr;
export function date(string: any): Expr;

export function next_id(): Expr;
export function equals(...args: any[]): Expr;
export function contains(path: any, _in: any): Expr;
export function select(path: any, from: any): Expr;
export function selectWithDefault(path: any, from: any, _default: any): Expr;
export function add(...args: any[]): Expr;
export function multiply(...args: any[]): Expr;
export function subtract(...args: any[]): Expr;
export function divide(...args: any[]): Expr;
export function modulo(...args: any[]): Expr;
export function lt(...args: any[]): Expr;
export function lte(...args: any[]): Expr;
export function gt(...args: any[]): Expr;
export function gte(...args: any[]): Expr;
export function and(...args: any[]): Expr;
export function or(...args: any[]): Expr;
export function not(bool: any): Expr;
