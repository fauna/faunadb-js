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
<script src="//cdn.jsdelivr.net/npm/faunadb@latest/dist/faunadb.js"></script>
```

The minified version of the driver can also be used via CDN:

```html
<script src="//cdn.jsdelivr.net/npm/faunadb@latest/dist/faunadb-min.js"></script>
```

### Use

The [tutorials](https://docs.fauna.com/fauna/current/howto/) in the
FaunaDB documentation contain other driver-specific examples.

#### Connecting from the browser

To get up and running quickly, below is a full example for connecting from the browser. Replace <your_key_here> with a database secret. You can get that by visiting your [FaunaDB Dashboard](https://dashboard.fauna.com/), creating a new database, clicking on "Security" in the sidebar on the left, and then clicking "New Key". To learn more about keys, see [FaunaDB Key System](https://docs.fauna.com/fauna/current/security/keys.html).

```javascript
<html>
  <head>
  </head>
<body>
  <h1>Test</h1>
</body>
<script src="https://cdn.jsdelivr.net/npm/faunadb@latest/dist/faunadb.js"></script>
<script type="text/javascript">
  var faunadb = window.faunadb
  var q = faunadb.query
  var client = new faunadb.Client({
    secret: 'your_key_here',
    domain: 'db.fauna.com',
    scheme: 'https',
  })
  client.query(
    q.ToDate('2018-06-06')
  )
  .then(function (res) { console.log('Result:', res) })
  a.catch(function (err) { console.log('Error:', err) })
</script>
</html>
```

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

#### Timeouts

The client can be configured to handle timeouts in two different ways:

1. Add a `timeout` field to the `options` block when instantiating the client
2. By setting a `queryTimeout` on the client (or passing the value to the client's `.query()` method directly)

The first option (i.e. `timeout`) represents a HTTP timeout on the client side. Defined in milliseconds, the client will wait the specified period before timing out if it has yet to receive a response.

```javascript
const client = new faunadb.Client({
  secret: 'YOUR_FAUNADB_SECRET',
  timeout: 100,
})
```

On the other hand, using the client's `queryTimeout` dictates how long FaunaDB will process the request on the server before timing out if it hasn't finished running the operation. This can be done in two different ways:

```javascript
// 1. Setting the value when instantiating a new client
const client = new faunadb.Client({
  queryTimeout: 2000,
  secret: 'YOUR_FAUNADB_SECRET',
})

// 2. Specifying the value per-query
var data = client.query(q.Paginate(q.Collections()), {
  queryTimeout: 100,
})
```

**Note:** When passing a `queryTimeout` value to `client.query()` as part of the `options` object, it will take precendence over any value set on the client when instantiating it.

#### Per-query options

Some options (currently only `secret` and `queryTimout`) can be overriden on a per-query basis:

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

```javascript
var data = client.query(q.Paginate(q.Collections()), {
  queryTimeout: 100,
})
```

#### Custom Fetch

To use a custom `fetch()` you just have to specify it in the configuration and make it compatible with the [standard Web API Specification of the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

```javascript
const customFetch = require('./customFetch')
const client = new faunadb.Client({
  secret: 'YOUR_FAUNADB_SECRET',
  fetch: customFetch,
})
```

## Client Development

Run `yarn` to install dependencies.

### Code

This project includes no polyfills. Support for Internet Explorer 11 requires
a `Promise` polyfill.

### Testing

The driver tests need to connect to a FaunaDB so we recommend you setup one locally. The fast way is running a docker image like `docker run --rm --name faunadb -p 8443:8443 fauna/faunadb`.

After have the faunadb working on local you have to setup a set of env variables before run the tests. You can set them manually or use a `.env` file for this.

```bash
FAUNA_DOMAIN=localhost
FAUNA_SCHEME=http
FAUNA_PORT=8443
FAUNA_ROOT_KEY=secret
```

- `yarn test`: This will run tests against the current version of Node.js.
  [nvm](https://github.com/creationix/nvm) is useful for managing multiple
  versions of Node.js for testing.

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
