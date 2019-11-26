# FaunaDB Javascript Driver

[![Npm Version](https://img.shields.io/npm/v/faunadb.svg?maxAge=21600)](https://www.npmjs.com/package/faunadb)
[![License](https://img.shields.io/badge/license-MPL_2.0-blue.svg?maxAge=2592000)](https://raw.githubusercontent.com/fauna/faunadb-js/master/LICENSE)

A Javascript driver for [FaunaDB](https://fauna.com).

[View reference JSDocs here](https://fauna.github.com/faunadb-js).

See the [FaunaDB Documentation](https://docs.fauna.com/) and
[Tutorials](https://docs.fauna.com/fauna/current/howto/) for guides and
a complete database [API
reference](https://docs.fauna.com/fauna/current/reference/queryapi/).

## Supported Runtimes

This Driver supports and is tested on:

- Node.js
  - LTS
  - Stable
- Chrome
- Firefox
- Safari
- Internet Explorer 11

## Using the Client

### Installation

#### Node.js

`npm install --save faunadb`

or

`yarn add faunadb`

#### Browsers

Via CDN:

```html
<script src="//cdn.jsdelivr.net/npm/faunadb@2.10.0/dist/faunadb.js"></script>
```

The minified version of the driver can also be used via CDN:

```html
<script src="//cdn.jsdelivr.net/npm/faunadb@2.10.0/dist/faunadb-min.js"></script>
```

### Use

The [tutorials](https://docs.fauna.com/fauna/current/howto/) in the
FaunaDB documentation contain driver-specific examples.

#### Requiring the Driver

```javascript
var faunadb = require('faunadb'),
  q = faunadb.query
```

This is the recommended require stanza. The `faunadb.query` module contains all
of the functions to create FaunaDB Query expressions.

#### Instantiating a Client and Issuing Queries

```javascript
var client = new faunadb.Client({ secret: 'YOUR_FAUNADB_SECRET' })
```

Once the client has been instantiated, it can be used to issue queries. For
example, to create an document in an existing collection named `test` with the data:
`{ testField: 'testValue' }`:

```javascript
var createP = client.query(
  q.Create(q.Collection('test'), { data: { testField: 'testValue' } })
)
```

All methods on `faunadb.Client` return [ES6 Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
So, if we wanted to handle the Promise to access the `Ref` of the newly created
document:

```javascript
createP.then(function(response) {
  console.log(response.ref) // Would log the ref to console.
})
```

`response` is a JSON object containing the FaunaDB response. See the JSDocs for
`faunadb.Client`.

#### Pagination Helpers

This driver contains helpers to provide a simpler API for consuming paged
responses from FaunaDB. See the [Paginate Function Reference](https://docs.fauna.com/fauna/current/reference/queryapi/read/paginate)
for a description of paged responses.

Using the helper to page over sets lets the driver handle cursoring and
pagination state. For example, `client.paginate`:

```javascript
var helper = client.paginate(q.Match(q.Index('test_index'), 'example-term'))
```

The return value, `helper`, is an instance of `PageHelper`. The `each` method will execute a
callback function on each consumed page.

```javascript
helper.each(function(page) {
  console.log(page) // Will log the page's contents, for example: [ Ref("collections/test/1234"), ... ]
})
```

Note that `each` returns a `Promise<void>` that is fulfilled on the completion
of pagination.

The pagination can be transformed server-side via the FaunaDB query language
via the `map` and `filter` functions.

For example, to retrieve the matched documents:

```javascript
helper
  .map(function(ref) {
    return q.Get(ref)
  })
  .each(function(page) {
    console.log(page) // Will now log the retrieved documents.
  })
```

[See the JSDocs](https://fauna.github.com/faunadb-js/PageHelper.html) for
more information on the pagination helper.

#### Per-query options

Some options (currently only `secret`) can be overriden on a per-query basis:

```javascript
var createP = client.query(
  q.Create(q.Collection('test'), { data: { testField: 'testValue' } }),
  { secret: 'YOUR_FAUNADB_SECRET' }
)
```

```javascript
var helper = client.paginate(
  q.Match(q.Index('test_index'), 'example-term'),
  null,
  {
    secret: 'YOUR_FAUNADB_SECRET',
  }
)
```

## Client Development

Run `yarn` to install dependencies.

### Code

This project includes no polyfills. Support for Internet Explorer 11 requires
a `Promise` polyfill.

### Testing

- `yarn test`: This will run tests against the current version of Node.js.
  [nvm](https://github.com/creationix/nvm) is useful for managing multiple
  versions of Node.js for testing.

Tests will read a `testConfig.json` file located in
the root directory of this project for Fauna client configuration. A minimal
`testConfig.json` file would contain your FaunaDB key:

```json
{ "auth": "YOUR_FAUNA_KEY" }
```

Each test run will create a new database, and will attempt to clean it up when
done. If the tests are cancelled, the test database will not get cleaned up.
Therefore it is recommended to use a FaunaDB key scoped to an empty parent
database created for this purpose, rather than your account's root key. This
will make cleanup of test databases as easy as removing the parent database.

See the [FaunaDB Multitenancy
Tutorial](https://docs.fauna.com/fauna/current/howto/multitenant) for
more information about nested databases.

Alternatively, tests can be run via a Docker container with
`FAUNA_ROOT_KEY="your-cloud-secret" make docker-test` (an alternate
Alpine-based NodeJS image can be provided via `RUNTIME_IMAGE`).

### Documentation

- `yarn doc` will generate JSDoc documentation for the project.

## License

Copyright 2019 [Fauna, Inc.](https://fauna.com/)

Licensed under the Mozilla Public License, Version 2.0 (the "License"); you may
not use this software except in compliance with the License. You may obtain a
copy of the License at

[http://mozilla.org/MPL/2.0/](http://mozilla.org/MPL/2.0/)

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.
