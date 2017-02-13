import Expr from "./Expr";

type ExprVal = (Expr|string|number|boolean|Object);
type ExprArg = (ExprVal|Array<ExprVal>);
export type Lambda = (...vars: any[]) => Expr;

export module query {
  export function Ref(ref: ExprArg, id?: ExprArg): Expr;
  export function At(timestamp: ExprArg, expr: ExprArg): Expr;
  export function Let(vars: ExprArg, in_expr: ExprArg): Expr;
  export function Var(varName: ExprArg): Expr;
  export function If(condition: ExprArg, then: ExprArg, _else: ExprArg): Expr;
  export function Do(...args: ExprArg[]): Expr;
  export function Object(fields: ExprArg): Expr;
  export function Lambda(f: Lambda): Expr;
  export function Lambda(var_name: ExprArg, expr: ExprArg): Expr;
  export function Map(collection: ExprArg, lambda_expr: Lambda): Expr;
  export function Foreach(collection: ExprArg, lambda_expr: Lambda): Expr;
  export function Filter(collection: ExprArg, lambda_expr: Lambda): Expr;
  export function Take(number: ExprArg, collection: ExprArg): Expr;
  export function Drop(number: ExprArg, collection: ExprArg): Expr;
  export function Prepend(elements: ExprArg, collection: ExprArg): Expr;
  export function Append(elements: ExprArg, collection: ExprArg): Expr;

  export function Get(ref: ExprArg, ts?: ExprArg): Expr;
  export function KeyFromSecret(secret: ExprArg): Expr;
  export function Paginate(set: ExprArg, opts?: Object): Expr;
  export function Exists(ref: ExprArg, ts?: ExprArg): Expr;

  export function Create(class_ref: ExprArg, params?: ExprArg): Expr;
  export function Update(ref: ExprArg, params: ExprArg): Expr;
  export function Replace(ref: ExprArg, params: ExprArg): Expr;
  export function Delete(ref: ExprArg): Expr;
  export function Insert(ref: ExprArg, ts: ExprArg, action: ExprArg, params: ExprArg): Expr;
  export function Remove(ref: ExprArg, ts: ExprArg, action: ExprArg): Expr;
  export function CreateClass(params: ExprArg): Expr;
  export function CreateDatabase(params: ExprArg): Expr;
  export function CreateIndex(params: ExprArg): Expr;
  export function CreateKey(params: ExprArg): Expr;

  export function Match(index: ExprArg, ...terms: ExprArg[]): Expr;
  export function Union(...sets: ExprArg[]): Expr;
  export function Intersection(...sets: ExprArg[]): Expr;
  export function Difference(...sets: ExprArg[]): Expr;
  export function Distinct(set: ExprArg): Expr;
  export function Join(source: ExprArg, target: (ExprArg|Lambda)): Expr;

  export function Login(ref: ExprArg, params: ExprArg): Expr;
  export function Logout(delete_tokens: ExprArg): Expr;
  export function Identify(ref: ExprArg, password: ExprArg): Expr;

  export function Concat(strings: ExprArg, separator?: ExprArg): Expr;
  export function Casefold(string: ExprArg): Expr;

  export function Time(string: ExprArg): Expr;
  export function Epoch(number: ExprArg, unit: ExprArg): Expr;
  export function Date(string: ExprArg): Expr;

  export function NextId(): Expr;
  export function Database(name: ExprArg): Expr;
  export function Index(name: ExprArg): Expr;
  export function Class(name: ExprArg): Expr;
  export function Equals(...args: ExprArg[]): Expr;
  export function Contains(path: ExprArg, _in: ExprArg): Expr;
  export function Select(path: ExprArg, from: ExprArg, _default?: ExprArg): Expr;
  export function Add(...args: ExprArg[]): Expr;
  export function Multiply(...args: ExprArg[]): Expr;
  export function Subtract(...args: ExprArg[]): Expr;
  export function Divide(...args: ExprArg[]): Expr;
  export function Modulo(...args: ExprArg[]): Expr;
  export function LT(...args: ExprArg[]): Expr;
  export function LTE(...args: ExprArg[]): Expr;
  export function GT(...args: ExprArg[]): Expr;
  export function GTE(...args: ExprArg[]): Expr;
  export function And(...args: ExprArg[]): Expr;
  export function Or(...args: ExprArg[]): Expr;
  export function Not(bool: ExprArg): Expr;
}
