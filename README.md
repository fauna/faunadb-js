# FaunaDB Javascript Driver

[![Build Status](https://img.shields.io/travis/fauna/faunadb-js/master.svg?maxAge=21600)](https://travis-ci.org/fauna/faunadb-js)
[![Coverage Status](https://img.shields.io/codecov/c/github/fauna/faunadb-js/master.svg?maxAge=21600)](https://codecov.io/gh/fauna/faunadb-js/branch/master)
[![Npm Version](https://img.shields.io/npm/v/faunadb.svg?maxAge=21600)](https://www.npmjs.com/package/faunadb)
[![License](https://img.shields.io/badge/license-MPL_2.0-blue.svg?maxAge=2592000)](https://raw.githubusercontent.com/fauna/faunadb-js/master/LICENSE)

A Javascript driver for [FaunaDB](https://fauna.com).

[View reference JSDocs here](https://fauna.github.com/faunadb-js).

See the [FaunaDB Documentation](https://fauna.com/documentation) and
[Tutorials](https://fauna.com/tutorials) for guides and a complete database
API reference.

## Supported Runtimes

This Driver supports and is tested on:

* Node.js
  * LTS (v4)
  * Stable (v6)
  * v0.12.x
* Chrome
* Firefox
* Safari
* Internet Explorer 11

## Using the Client

### Installation

#### Node.js

`npm install faunadb`

See [faunadb on NPM](https://npmjs.com/package/faunadb) for more information.

#### Browsers

The browser release can be found in the [fauna/faunadb-js-release](https://github.com/fauna/faunadb-js-release) repository.

This release can be installed via bower:

`bower install faunadb`

### Use

The [tutorials](http://fauna.com/tutorials) in the FaunaDB documentation
contain driver-specific examples.

#### Requiring the Driver

```javascript
var faunadb = require('faunadb'),
  q = faunadb.query,
  Ref = q.Ref;
  // Insert additional namespace aliases here.
```

This is the recommended require stanza. The `faunadb.query` module contains all
of the functions to create FaunaDB Query expressions. This example also shows
an example of defining a local `Ref` name, so as to not have to call `q.Ref` at
all times.

#### Instantiating a Client and Issuing Queries
```javascript
var client = new faunadb.Client({ secret: 'YOUR_FAUNADB_SECRET' });
```

Once the client has been instantiated, it can be used to issue queries. For
example, to create an instance in an existing class named `test` with the data:
`{ testField: 'testValue' }`:

```javascript
var createP = client.query(q.Create(Ref('classes/test'), { testField: 'testValue' }));
```

Note that we are using the `Ref` alias defined above here.

All methods on `faunadb.Client` return [ES6 Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
So, if we wanted to handle the Promise to access the `Ref` of the newly created
instance:

```javascript
createP.then(function(res) {
  console.log(res.ref); // Would log the ref to console.
});
```

`res` is a JSON object containing the FaunaDB response. See the JSDocs for
`faunadb.Client`, and the [FaunaDB Developer Guide](https://fauna.com/documentation/dev)
for more information on responses.

#### Pagination Helpers

This driver contains helpers to provide a simpler API for consuming paged
responses from FaunaDB. See the [FaunaDB Developer Guide](https://fauna.com/documentation/dev) 
and the [Paginate Function Reference](https://fauna.com/documentation/queries#read_functions-paginate_set)
for a description of paged responses.

Using the helper to page over sets lets the driver handle cursoring and
pagination state. For example:

```javascript
var helper = client.paginate(q.Match(Ref('indexes/test_index'), 'example-term'));
```

Here, `helper` is an instance of `PageHelper`. The `each` method will execute a
callback function on each consumed page.

```javascript
helper.each(function(page) {
  console.log(page); // Will log the page's contents, for example: [ Ref("classes/test/1234"), ... ]
});
```

Note that `each` returns a `Promise<void>` that is fulfilled on the completion
of pagination.

The pagination can be transformed server-side via the FaunaDB query language
via the `map` and `filter` functions.

For example, to retrieve the matched instances:

```javascript
helper.map(function(ref) { return q.Get(ref); }).each(function(page) {
  console.log(page); // Will now log the retrieved instances.
});
```

[See the JSDocs](https://fauna.github.com/faunadb-js/PageHelper.html) for
more information on the pagination helper.

## Client Development

Run `npm install` to install dependencies.

### Code

As the driver targets multiple JS runtimes, it is developed in vanilla ES5.  We
use the [es6-promise](https://github.com/stefanpenner/es6-promise) polyfill in
order to provide Promise support.

### Testing

* `npm run test`: This will run tests against the current version of Node.js.
  [nvm](https://github.com/creationix/nvm) is useful for managing multiple
  versions of Node.js for testing.
* `npm run coverage`: This will run tests with coverage enabled.
* `npm run browser-test-{mac|linux|win}`: This will run tests against
  platform-specific browsers.  [Karma](https://karma-runner.github.io/1.0/index.html) 
  is used as the test runner.

Both Node.js and browser tests will read a `testConfig.json` file located in
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

See the [FaunaDB Multitenancy Tutorial](https://fauna.com/tutorials/multitenant) for more
information about nested databases.

### Documentation

* `npm run doc` will generate JSDoc documentation for the project.

## License

Copyright 2017 [Fauna, Inc.](https://fauna.com/)

Licensed under the Mozilla Public License, Version 2.0 (the "License"); you may
not use this software except in compliance with the License. You may obtain a
copy of the License at

[http://mozilla.org/MPL/2.0/](http://mozilla.org/MPL/2.0/)

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.
