export default class Expr {
  constructor(obj: object)
  readonly raw: object

  static toString(expr: Expr): string
}
