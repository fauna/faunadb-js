export default class Expr {
  constructor(obj: object)

  readonly _isFaunaExpr?: boolean
  toFQL(): string
  static toString(expr: Expr): string
}
