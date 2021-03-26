import Expr from '../Expr'
import { wrap } from './wrap'

/**
 * @private
 */
export default function lambdaExpr(var_name, expr) {
  return new Expr({ lambda: wrap(var_name), expr: wrap(expr) })
}
