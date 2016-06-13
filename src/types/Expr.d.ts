export class Expr {
  static wrap(obj: Object): Expr;
  static wrapValues(obj: Object): Object;

  constructor(obj: Object);
}