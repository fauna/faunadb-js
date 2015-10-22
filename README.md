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
      "rootKey": {"user": "secret"}
    }

`domain`, `scheme`, and `port` are optional and will default to FaunaDB cloud.
So to test with cloud, `testConfig.json` is as simple as:

  {
    "rootKey": {"user": "me@example.com": "pass": "swordfish"}
  }

You can also set the `FAUNA_DOMAIN`, `FAUNA_SCHEME`, `FAUNA_PORT`, and `FAUNA_ROOT_KEY` environment variables. `FAUNA_ROOT_KEY` may look like `me@example.com:swordfish` for cloud accounts.

Not that when testing in cloud, builtin tests for database, key, and custom field will fail as cloud accounts do not have access to that functionality.

Testing uses a require hook, so building isn't necessary.

For fuller testing, run `./test-all.sh`, which uses [nvm](https://github.com/creationix/nvm).

To run a single test file:

    npm install -g mocha
    mocha --compilers js:babel/register test/client_test.js
