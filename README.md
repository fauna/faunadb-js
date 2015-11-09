Node.js client for [FaunaDB](https://faunadb.com).

View documentation [here](https://faunadb.github.io/faunadb-js/).

See an example [here](https://github.com/faunadb/faunadb-js/blob/master/examples/faunadb-test.js)
([EcmaScript 7 version](https://github.com/faunadb/faunadb-js/blob/master/examples/faunadb-test-es7.js)).

See the [FaunaDB Documentation](https://faunadb.com/documentation) for
a complete API reference, or look in
[`/tests`](https://github.com/faunadb/faunadb-python/tree/master/tests) for more
examples.

## Using the Client

### Install

    npm install faunadb/faunadb-js

### Use

All work with FaunaDB happens through a Client instance.
All Client methods return [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).
Although it's possible to use Client alone, it's often easier to do work through Model classes.
For advanced work, the query api (`faunadb/lib/query`) will be useful.


## Building it yourself

### Setup

    npm install


### Build

`npm run build` or `npm run watch`.


### Test

    npm run test

To run tests, you will need to create a `testConfig.json` in the faunadb-js directory
that looks like this:

    {
      "domain": "localhost",
      "scheme": "http",
      "port": 8443,
      "auth": {"user": "secret"}
    }

`domain`, `scheme`, and `port` are optional and will default to FaunaDB cloud.
So to test with cloud, `testConfig.json` is as simple as:

    {
      "auth": {"user": "me@example.com", "pass": "swordfish"}
    }

You can also set the `FAUNA_DOMAIN`, `FAUNA_SCHEME`, `FAUNA_PORT`, and `FAUNA_ROOT_KEY` environment variables. `FAUNA_ROOT_KEY` may look like `me@example.com:swordfish` for cloud accounts.

Note that when testing in cloud, builtin tests for database, key, and custom field will fail as cloud accounts do not have access to that functionality.

Testing uses a require hook, so building isn't necessary.

For fuller testing, run `./test-all.sh`, which uses [nvm](https://github.com/creationix/nvm).

To run a single test file:

    npm install -g mocha
    mocha --compilers js:babel/register test/client_test.js


### Document

    npm run doc


### Contribute

GitHub pull requests are very welcome.


## LICENSE

Copyright 2015 [Fauna, Inc.](https://faunadb.com/)

Licensed under the Mozilla Public License, Version 2.0 (the
"License"); you may not use this software except in compliance with
the License. You may obtain a copy of the License at

[http://mozilla.org/MPL/2.0/](http://mozilla.org/MPL/2.0/)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
implied. See the License for the specific language governing
permissions and limitations under the License.
