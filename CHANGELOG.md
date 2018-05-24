## 1.1.3-SNAPSHOT
- Adds support for @query type (user defined functions)
- Set Fauna Api version to 2.0

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
