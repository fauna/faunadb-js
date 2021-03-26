import annotate from 'fn-annotate'
import { InvalidValue } from '../errors.js'
import lambdaExpr from './lambdaExpr'
import Var from './Var'

/**
 * @private
 */
export default function lambdaFunc(func) {
  var vars = annotate(func)
  switch (vars.length) {
    case 0:
      throw new InvalidValue('Provided Function must take at least 1 argument.')
    case 1:
      return lambdaExpr(vars[0], func(Var(vars[0])))
    default:
      return lambdaExpr(
        vars,
        func.apply(
          null,
          vars.map(function(name) {
            return Var(name)
          })
        )
      )
  }
}
