export default class Expr {
  constructor(obj: object)

  readonly _isFaunaExpr?: boolean
  toFQL(): string
  toJSON(): string
  static toString(expr: Expr): string
}
