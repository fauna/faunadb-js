import { InvalidValue } from '../errors'
import Expr from '../Expr'
import { checkInstanceHasProperty } from '../_util'
import arity from './arity'
import lambdaExpr from './lambdaExpr'
import lambdaFunc from './lambdaFunc'

/**
 * See the [docs](https://app.fauna.com/documentation/reference/queryapi#basic-forms).
 *
 * Takes a Javascript function, and will transform it
 * into the appropriate FaunaDB query. For example:
 *
 * ```
 * Lambda(function(a) { return Add(a, a); });
 * // Returns { lambda: 'a', expr: { add: [{ var: a }, { var: a }] } }
 * ```
 * Note that the driver will handle wrapping all usages of the lambda's bound
 * variables with the {@link modules:query~Var} function.
 *
 * @param {function} func
 *   Takes the provided function and produces the appropriate FaunaDB query expression.
 * @return {Expr}
 *
 */

export default function Lambda() {
  arity.between(1, 2, arguments, Lambda.name)
  switch (arguments.length) {
    case 1:
      var value = arguments[0]
      if (typeof value === 'function') {
        return lambdaFunc(value)
      } else if (
        value instanceof Expr ||
        checkInstanceHasProperty(value, '_isFaunaExpr')
      ) {
        return value
      } else {
        throw new InvalidValue(
          'Lambda function takes either a Function or an Expr.'
        )
      }
    case 2:
      var var_name = arguments[0]
      var expr = arguments[1]

      return lambdaExpr(var_name, expr)
  }
}
