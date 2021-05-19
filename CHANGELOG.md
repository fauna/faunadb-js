## 4.3.0

- Implements Client#close method, allows Infinity for `http2SessionIdleTime` parameter
- Adds missed tests for FQL queries
- Fixes cross-platform global object
- Notifies about new package version and shows release notes on install
- Exposes parseJSON from utils
- Adds `NGram` to special cases for snake_case to CamelCase conversion
- Adds load tests
- Automatically create Jira ticket on GitHub issue
- Fixes handling of `Let` bindings when a key's value is undefined
- Fixes JSON parsing of field names containing spaces
- Updates GitHub link to .io instead of .com
- Remaps 429 HTTP error to `TooManyRequests` error type

## 4.2.0

- Improve HTTP2 session timeout handling
- Add the `FAUNADB_HTTP2_SESSION_IDLE_TIME` environment variable  
  to specify the default HTTP2 session timeout period
- Implement a fix for the lack of a `navigator` object in Cloudflare Workers

## 4.1.3

- Revert X-Query-Timeout improvement (will be introduced in a major release)
- Revert http2 session idle time (will be changed to a manual handling by a 'close' method in a major release)

## 4.1.2

- Expose API version as a Client's static property
- Fix Stream API type definition (TypeScript)
- Always pass X-Query-Timeout
- Combine timeout & queryTimeout
- Set http2 session idle time
- Omit the port value if it's falsy
- Expr to FQL logic fixes

## 4.1.1

- Fallback to HTTP1 in case old NodeJS version doesn't support it

## 4.1.0

- Add runtime env headers
- Enhance isNodeJS recognition
- Add `observer` option for `client.query`
- Add NodeJS HTTP2 support

## 4.0.3

- Fix build for webpack

## 4.0.2

- Use AbortController polyfill

## 4.0.1

- Fix null in zero-argument functions for toFQL stringification
- Fix http request timeout not passed to `fetch` function
- Fix stream `end` event shallowed for NodeJS
- Improve Typescript definitions
- Add exp.toFQL
- Reduce web bundle size

## 4.0.0

- Adds AccessProvider() support for authenticating with external auth providers (ex. Auth0, Okta)
- Adds beta support for event streaming
- Adds new FQL functions: CreateAccessProvider(), AccessProviders(), AccessProvider(), CurrentIdentity(), HasCurrentIdentity(), CurrentToken(), and HasCurrentToken()
- Deprecates Identity() function in favor of CurrentIdentity()
- Deprecates HasIdentity() in favor of HasCurrentIdentity()

## 3.0.0

- Added an alias of the Contains function called ContainsPath, and deprecated the Contains function.
- Added the new functions ContainsField and ContainsValue functions to make it easier to explore the structure of objects and documents.
- Added the new Reverse function to reverse the order of items in an Array, Page, or Set.
- Add support for versioned `@query` values.

## 2.14.2

- Fix a bug with instanceof conditions
- Fix incorrect casing for FQL function names
- Fix Paginate/Match rendering

## 2.14.1

- Fix type mismatch for FaunaHTTPError constructor
- Rollback ESM support breaking changes

## 2.14.0

- Add client-specified query timeout
- Configure build script to output ES Module

## 2.13.1

- Fix arity messages
- Improve RequestResult types

## 2.13.0

- Add custom fetch option

## 2.12.0

- Add `headers` config on `Client`
- Improve arity error log information
- Fix Expr.toString type definition
- Fix FaunaHTTPError type definition
- Fix Expr.toExpr when value is a string
- Fix native schema rendering

## 2.11.1

- Fix npm package

## 2.11.0

- Add Documents

## 2.10.3

- Fix the types for `If` so that `null` is a valid result

## 2.10.2

- Add custom headers

## 2.10.0

- Add ToDouble, ToInteger
- Add ToObject, ToArray
- Add Any, All
- Add TimeAdd, TimeSubtract, TimeDiff
- Removed `es6-promise` dependency

## 2.9.4

- Removed `client` from `RequestResult` to prevent accidental logging of secret

## 2.9.3

- Replaced `isomorphic-unfetch` with [`cross-fetch`](https://github.com/lquixada/cross-fetch)
- No longer requiring http/s libraries in browser environments

## 2.9.2

- Bug fix related to `require('url')` in browsers

## 2.9.1

- Add Count, Mean, Sum, Min, Max
- Add StartsWith, EndsWith, ContainsStr, ContainsStrRegex, RegexEscape
- Add MoveDatabase
- Add Now
- Add `keepAlive` option for clients in Node
- Dynamic require removed (bug fix)
- Replaced `superagent` with [`isomorphic-unfetch`](https://github.com/developit/unfetch/tree/master/packages/isomorphic-unfetch)
- Typescript definitions for date and time related functions
- Added support for `cursor` option with `PageHelper`

## 2.8.1

- Keep alive connections enabled on NodeJS environments
- Enhance SetRef toString()
- Add generic type for client.query()
- Add new types Document and Page
- Fix render order of Filter(), Map(), Foreach()
- Fix npm security warnings

## 2.8.0

- Add stdlib functions: Reduce(), Merge(), Range(), Format()

## 2.7.0

- Add stdlib time functions ToSeconds(), ToMillis(), ToMicros(), DayOfWeek(),
  DayOfMonth(), DayOfYear(), Month(), Hour(), Minute(), Second()
- Support new schema names: Class -> Collection; Instance -> Document
  Deprecate CreateClass(), Class(), and Classes() in favor of
  CreateCollection(), Collection(), Collections()
- Fix rendering of Let() function
- Add functions for RBAC: CreateRole(), Role(), Roles()

## 2.6.1

- Make the FaunaClient.query(..) function generic for Typescript
- Temporarily disable X-Last-Seen-Txn header due to CORS issues

## 2.6.0

- Add stdlib math functions Abs(), Asin(), Acos(), Atan(), BitAnd(), BitNot(),
  BitOr(), BitXor(), Ceil(), Cos(), Cosh(), Degrees(), Divide(), Exp(), Floor(),
  Hypot(), Ln(), Log(), Max(), Min(), Modulo(), Pow(), Radians(), Round(),
  Sign(), Sin(), Sinh(), Sqrt(), Tan(), Tanh(), Trunc()
- Add stdlib string functions FindStr(), FindStrRegex(), Length(), Lower(),
  LTrim(), Repeat(), ReplaceStr(), ReplaceStrRegex(), RTrim(), Space(),
  SubString(), TitleCase(), Trim(), Upper()
- Add support for backrefs in `Let()`. Requires FaunaDB 2.6.0
- Expose last seen txn time via `getLastTxnTime()`

## 2.5.2 (September 26, 2018)

- Fix README example
- Fix min/max parameters on ngram function
- Update documentation with correct links

## 2.5.1 (September 7, 2018)

- Fix a bug on `Do()` function that was preventing expressions with only one statement
- Fix bug on string formatter of expressions types
- Adds support for Symbol type

## 2.5.0 (August 1, 2018)

- Add support for the X-Last-Seen-Txn header

## 2.1.0 (July 25, 2018)

- Bug fix: Typescript functions that receive lambda should support lambdas created
  by `Lambda()` function.
- Adds `to_string`, `to_number`, `to_time`, and `to_date` functions
- Pretty print Fauna objects
- Adds `@bytes` constructor on query api

## 2.0.2 (March 28, 2018)

- Bug fix: functions with optional scope parameter were failing when scope was
  omitted.

## 2.0.1 (March 24, 2018)

- Adds `ngram` function
- Adds `is_empty` and `is_nonempty` functions
- Provide a raw view of the query in the RequestResult

## 2.0.0 (March 19, 2018)

- Adds support for @query type (user defined functions)
- Adds support for recursive references
- Removes `get`, `post`, `put`, `patch` and `delete` methods from `Client` class
- Adds `abort` function
- Adds `normalizer` argument to `casefold` function
- Adds `new_id` function
- Deprecated `next_id` in favor of `new_id`
- Adds `identity` and `has_identity` functions
- Adds `singleton` and `events` functions
- Adds `select_all` function

## 1.1.2 (July 06, 2017)

- Fix typescript declaration file to include default types

## 1.1.1 (March 28, 2017)

- Fix wrap of literal objects for lambda form of let expression

## 1.1.0 (March 22, 2017)

- Accept lambdas at Let function

## 1.0.1 (March 21, 2017)

- Fix wrap of Select's default parameter in order to allow other types rather
  than Object.

## 1.0.0 (March 13, 2017)

- Official release

## 0.2.4 (March 3, 2017)

- Using literal strings as Error class names to avoid problems with minified
  code

## 0.2.3 (February 27, 2017)

- Change the default cloud endpoint from `cloud.faunadb.com` to `db.fauna.com`.
- Adds support for key_from_secret function.
- Adds support for at function.
- Adds support for @bytes type.

## 0.2.2 (November 30, 2016)

- Remove count function
- Adding missing ref constructors for database, index, and class.
- Adding missing write functions: create database, create index, create key, and
  create class.
- Restrict query language functions arity for safety

## 0.2.1 (September 6, 2016)

- Change the default cloud endpoint from `rest.faunadb.com` to `cloud.faunadb.com`.

## 0.2.0

- Initial Release on NPM
