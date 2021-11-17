# FaunaDB Javascript Driver

[![CircleCI](https://circleci.com/gh/fauna/faunadb-js.svg?style=svg)](https://circleci.com/gh/fauna/faunadb-js)
[![Npm Version](https://img.shields.io/npm/v/faunadb.svg?maxAge=21600)](https://www.npmjs.com/package/faunadb)
[![License](https://img.shields.io/badge/license-MPL_2.0-blue.svg?maxAge=2592000)](https://raw.githubusercontent.com/fauna/faunadb-js/main/LICENSE)

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

A Javascript driver for [FaunaDB](https://fauna.com).

[View reference JSDocs here](https://fauna.github.io/faunadb-js).

See the [FaunaDB Documentation](https://docs.fauna.com/) and
[Tutorials](https://docs.fauna.com/fauna/current/tutorials/crud) for
guides and a complete database [API
reference](https://docs.fauna.com/fauna/current/api/fql/).

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

The [tutorials](https://docs.fauna.com/fauna/current/tutorials/crud) in
the FaunaDB documentation contain other driver-specific examples.

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
  var client = new faunadb.Client({
    secret: 'your_key_here',
    domain: 'db.fauna.com',
    scheme: 'https',
  })
  client.query(
    faunadb.query.ToDate('2018-06-06')
  )
  .then((res) { console.log('Result:', res) })
  .catch(function (err) { console.log('Error:', err) })
</script>
</html>
```

#### Requiring the Driver

```javascript
var faunadb = require('faunadb'),
var query = require('faunadb/query)
```

The `faunadb/query` module contains all of the functions to create FaunaDB Query expressions.

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

#### ES6 modules

This is recommended way to inject faunadb-js. Many build tools supports three shaking which relies on the static structure of ES6 module syntax, i.e. `import` and `export`.

```
import { Client } from 'faunadb'
import { Now } from 'faunadb/query'
const client =new Client({secret: 'your_key_here'})
client.query(Now()).then(console.info)
```

Import all query functions in one line

```
import * as q from 'faunadb/query'
```

Deep imports. This is the recommended way to import query functions as modern bundle tools would tree-shake package and include only used functions.

```
import Select from 'faunadb/query/Select'
import Var from 'faunadb/query/Var'
```

#### Migration guide from 4.X.X to 5.X.X

##### Overview

faunadb-js from version 5.X.X support EcmaScript modules system which brings availability for bundle tools like webpack, rollup execute three-shake package and remove unused code, therefore bundle size would be smaller. In additional to that, 5.X.X also has some breaking changes

##### Use queryTimeout in flavor of timeout

`timeout` option for `new Client` and `client.query` has been removed. use `queryTimeout`

##### Faunadb imports (TBD if this have to be public API)

```diff
const faunadb = require('faunadb')
- const { Ref, FaunaDate, Bytes, ... } = faunadb.values
+ const { Ref, FaunaDate, Bytes, ... } = faunadb
- const { InvalidArity, FaunaHTTPError, BadRequest, ... } = faunadb.errors
+ const { InvalidArity, FaunaHTTPError, BadRequest, ... } = faunadb
- const { logger, showRequestResult } = faunadb.clientLogger
+ const { logger, showRequestResult } = faunadb
```

### Exceptions handling

With the 5.0.0 release, child classes of the base FaunaError class now exist.
Each class corresponds to an error code from Fauna.
Inspect the [`errors.js`](https://github.com/fauna/faunadb-js/blob/dcf8c4eece22b344b0a64c76a192634bd747e234/src/errors.js)
file for more information on how it is implemented.

The following example demonstrates the methods that you can access from the exception object:

```
import { Client, TransactionAbortedError, AuthenticationFailedError } from 'faunadb'

const client = new Client()

async function run() {
  try {
    await client.query()
  } catch(error) {
    if(error instanceof TransactionAbortedError) {
      console.error({
        code: error.code,
        position: e.position,
        msg: e.message,
        httpStatusCode: e.httpStatusCode
      })
      return
    }

    if(error instanceof AuthenticationFailedError) {
      console.error('invalid creds')
    }
  }
}
run()
```

##### Import query functions

All query functions has been removed from main package and hosted under sub-module `faunadb/query`.
CommonJS

```diff
const faunadb = require('faunadb');
-const q = faunadb.query;
+const q = require('faunadb/query');
```

EcmaScript

```javascript
import { Client } from 'faunadb'
// Import all queries by one command
import * as q from 'faunadb/query'
// Named imports
import { Select, Var } from 'faunadb/query'
// Deep imports
import Select from 'faunadb/query/Select'
import Var from 'faunadb/query/Var'
```

Although most modern bundle tools are able to tree-shake package with named imports, we recommend to use deep imports.

##### Renamed queries

Due to restriction of JS reserved words some queries has been renamed

```diff
client.query(
-  Get(Function('increment'))
+  Get(FaunaFunction('increment'))
)
.then((ret) => console.log(ret))
.catch((err) => console.error('Error: %s', err))
```

```diff
client.query(
-  Paginate(Match(Index('name'))),
+  Paginate(Match(FaunaIndex('name'))),
)
.then((ret) => console.log(ret))
.catch((err) => console.error('Error: %s', err))
```

##### Streaming API

```diff
const faunadb = require('faunadb')
const q = require('faunadb/query')
+ const Stream = require('faunadb/stream')
const client = new faunadb.Client({secret: 'YOUR_FAUNA_SECRET'})
+ const streamApi = new StreamApi({ client })
const docRef = q.Ref(q.Collection('Scores'), '1')
let stream
const startStream = () => {
-  stream = client.stream.document(docRef)
+  stream = streamApi.document(docRef)
  .on('snapshot', snapshot => {
    report(snapshot)
  })
  .on('version', version => {
    report(version)
  })
  .on('error', error => {
    console.log('Error:', error)
    stream.close()
    setTimeout(startStream, 1000)
  })
  .start()
}
startStream()
```

#### Pagination Helpers

This driver contains helpers to provide a simpler API for consuming paged
responses from FaunaDB. See the [Paginate function
reference](https://docs.fauna.com/fauna/current/api/fql/functions/paginate)
for a description of paged responses.

Using the helper to page over sets lets the driver handle cursoring and
pagination state. For example, `client.paginate`:

```javascript
var helper = client.paginate(
  q.Match(q.FaunaIndex('test_index'), 'example-term')
)
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

[See the JSDocs](https://fauna.github.io/faunadb-js/PageHelper.html) for
more information on the pagination helper.

#### Timeouts

The client can be configured to handle timeout by setting a `queryTimeout` on the client (or passing the value to the client's `.query()` method directly)

Using the client's `queryTimeout` dictates how long FaunaDB will process the request on the server before timing out if it hasn't finished running the operation. This can be done in two different ways:

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
  q.Match(q.FaunaIndex('test_index'), 'example-term'),
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

#### HTTP/2 Session Idle Time (Node.js only)

When running on the Node.js platform, the Fauna client uses [HTTP/2 multiplexing](https://stackoverflow.com/questions/36517829/what-does-multiplexing-mean-in-http-2)
to reuse the same session for many simultaneous requests. After all open requests
have been resolved, the client will keep the session open for a period of time
(500ms by default) to be reused for any new requests.

The `http2SessionIdleTime` parameter may be used to control how long the HTTP/2
session remains open while the connection is idle. To save on the overhead of
closing and re-opening the session, set `http2SessionIdleTime` to a longer time
--- or even `Infinity`, to keep the session alive indefinitely.

While an HTTP/2 session is alive, the client will hold the Node.js event loop
open; this prevents the process from terminating. Call `Client#close` to manually
close the session and allow the process to terminate. This is particularly
important if `http2SessionIdleTime` is long or `Infinity`:

```javascript
// sample.js (run it with "node sample.js" command)
const { Client, query: Q } = require('faunadb')

async function main() {
  const client = new Client({
    secret: 'YOUR_FAUNADB_SECRET',
    http2SessionIdleTime: Infinity,
    //                    ^^^ Infinity or non-negative integer
  })
  const output = await client.query(Q.Add(1, 1))

  console.log(output)

  client.close()
  //     ^^^ If it's not called then the process won't terminate
}

main().catch(console.error)
```

## Known issues

### Using with Cloudflare Workers

Cloudflare Workers have neither XMLHttpRequest nor fetch in the global scope.
Therefore, the `cross-fetch` package is unable to inject its own `fetch()` function, and throws an error.
The `fetch()` function is injected via a closure, so the workaround would be to pass
the fetch objects when initiating the FaunaDB client config. Cloudflare Workers also
doesn't support the use of an AbortController, which terminates requests as well as streams.
Here is a workaround:

```javascript
const c = new faunadb.Client({
  secret: 'your secret',
  fetch: (url, params) => {
    const signal = params.signal
    delete params.signal
    const abortPromise = new Promise(resolve => {
      if (signal) {
        signal.onabort = resolve
      }
    })
    return Promise.race([abortPromise, fetch(url, params)])
  },
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
AUTH_0_URI=https://{TENANT}.auth0.com/
AUTH_0_TOKEN=auth0 token
```

[Guide for Auth0](https://auth0.com/docs/tokens/management-api-access-tokens/create-and-authorize-a-machine-to-machine-application)

- `yarn test`: This will run tests against the current version of Node.js.
  [nvm](https://github.com/creationix/nvm) is useful for managing multiple
  versions of Node.js for testing.

Each test run will create a new database, and will attempt to clean it up when
done. If the tests are cancelled, the test database will not get cleaned up.
Therefore it is recommended to use a FaunaDB key scoped to an empty parent
database created for this purpose, rather than your account's root key. This
will make cleanup of test databases as easy as removing the parent database.

See the [FaunaDB Multitenancy
Tutorial](https://docs.fauna.com/fauna/current/tutorials/multitenant)
for more information about nested databases.

Alternatively, tests can be run via a Docker container with
`FAUNA_ROOT_KEY="your-cloud-secret" make docker-test` (an alternate
Alpine-based NodeJS image can be provided via `RUNTIME_IMAGE`).

### Documentation

- `yarn doc` will generate JSDoc documentation for the project.

### Previewing upcoming functionality

If you want to preview unreleased features in your project, you can do so by installing this driver using one of the following methods.

#### 1. Using a git URL

Normally, you would install the latest release of this package using `npm install --save faunadb` or `yarn add faunadb`. To access our latest features, you will need to define this dependency [by using a git URL](https://docs.npmjs.com/files/package.json#dependencies).

1. Open your `package.json` file

2. If you have already installed this driver, you should see the following in your list of dependencies. If not, add it.

```
"faunadb": "^5.0.0-preview.1"
```

3. Instead of using a version from the npm registry, we'll want to point our `package.json` to the `main` branch of our GitHub repo. To do that, change the `^5.0.0-preview.1` to `fauna/faunadb-js#main`.

```
"faunadb": "fauna/faunadb-js#v5"
```

4. Update your `node_modules` by running `npm install` or `yarn`

#### 2. Using `npm pack`

1. Clone this repo to your local system

```bash
git clone https://github.com/fauna/faunadb-js.git
```

2. Navigate to the cloned repo and open the `package.json`

```bash
cd faunadb-js
code package.json
```

3. Change the `version` to be semantic. For example, `5.0.0-beta`.

4. Run `npm run build:package`

5. Run `npm pack`. This creates a tarball at the root of your project directory which represents the image sent to the NPM registry when publishing.

6. In another project, you can now install the beta from the local image you just created by running:

```bash
npm install /path/to/tarball
```

## License

Copyright 2021 [Fauna, Inc.](https://fauna.com/)

Licensed under the Mozilla Public License, Version 2.0 (the "License"); you may
not use this software except in compliance with the License. You may obtain a
copy of the License at

[http://mozilla.org/MPL/2.0/](http://mozilla.org/MPL/2.0/)

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.
