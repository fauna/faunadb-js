# FaunaDB JS Driver Reference Documentation

See the README and the [Official FaunaDB Documentation](https://fauna.com/documentation) for examples and tutorials.

## Required Classes and Modules

* [Client](Client.html): Instances of this Class are used to communicate with FaunaDB.
* [query module](module-query.html): Contains functions used to build FaunaDB Query expressions.

## Other Classes and Modules

* [PageHelper](PageHelper.html): A helper Class to provide a simpler API for consuming paged responses.
* [errors module](module-errors.html): Contains exception classes thrown by [Client](Client.html) instances
  and [query](module-query.html) functions.
* [clientLogger module](module-clientLogger.html): Contains functions used to easily create debug logging and observer callbacks.
* [RequestResult](RequestResult.html): A container structure provided to observers registered in [Client](Client.html) instances.

## Internal types and modules

* [Expr](Expr.html): A base class for FaunaDB expression types.
* [values module](module-values.html): Class hierarchy for FaunaDB value types.
