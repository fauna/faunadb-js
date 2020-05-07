export default class Expr {
  constructor(obj: object)

  readonly _isFaunaExpr?: boolean
  static toString(expr: Expr): string
}
