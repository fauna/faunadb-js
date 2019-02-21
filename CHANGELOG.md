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
