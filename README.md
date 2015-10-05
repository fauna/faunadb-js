(TODO: actual README content)

## Build

    npm install
    npm run build

## Test

    npm run test

To run tests, you will need to create a `testConfig.json` in the faunadb-js directory
that looks like this:

    {
      "domain": "localhost",
      "scheme": "http",
      "port": 8443,
      "rootKey": "secret"
    }

`domain`, `scheme`, and `port` are optional and will default to FaunaDB cloud.

You can also set the `FAUNA_DOMAIN`, `FAUNA_SCHEME`, `FAUNA_PORT`, and `FAUNA_ROOT_KEY` environment variables.

Testing uses a require hook, so building isn't necessary.

You should have these environment variables set:

* FAUNA_DOMAIN
* FAUNA_SCHEME
* FAUNA_PORT
* FAUNA_ROOT_KEY

For fuller testing, run `./test-all.sh`, which uses [nvm](https://github.com/creationix/nvm).

To run a single test file:

    npm install -g mocha
    mocha --compilers js:babel/register test/client_test.js
