/* eslint-env es6 */
//      faunadb-js 0.2.0

'use strict';

// Introduction
// ------------
// TODO: ensure this doc link is right
// This is intended to show basic usage of the FaunaDB Javascript client. For a general
// overview of FaunaDB, please see https://faunadb.com/documentation

// Client Setup
// ------------

var faunadb = require('../index'),
  errors = faunadb.errors,
  q = faunadb.query,
  Ref = q.Ref; // We declare Ref here for convenience.

// Create a client.
var rootClient = new faunadb.Client({
  domain: 'localhost',
  port: 8444,
  scheme: 'http',
  secret: { user: 'secret' }
});


// Using the FaunaDB Client
// ------------------------
// TODO: Remove random name?
// Lets first create a database.
var dbName = 'my_test_db_' + require('crypto').randomBytes(4).toString('hex');

// We will define the query first:
var dbCreateQ = q.create(Ref('databases'), { name: dbName });

// TODO: Link to Promise docs
// Then we will execute the query. This returns a Promise.
var dbCreateP = rootClient.query(dbCreateQ);

dbCreateP.then((res) => {
  // The res object is a JS object containing the FaunaDB response. For example,
  // in this case, res looks like this:
  // ```
  // { ref: Ref("databases/my_test_db"),
  //   class: Ref("databases"),
  //   ts: 1466552496631000,
  //   name: 'my_test_db' }
  // ```
  // See the FaunaDB reference documentation for the definition of FaunaDB responses.

  return res.ref;
}).then((dbRef) => {
  // Now lets create a key to access our new database.
  return rootClient.query(q.create(Ref('keys'), { database: dbRef, role: 'server' }));
}).then((res) => {
  // Again, res is a JS object containing the FaunaDB response. In this case, the response
  // object would look similar to:
  // ```
  // { ref: Ref("keys/136623420662087680"),
  //   class: Ref("keys"),
  //   ts: 1466553097301000,
  //   database: Ref("databases/my_test_db_bc59a730ed8e"),
  //   role: 'server',
  //   secret: 'kqnPAeViRviQAAC0m2PVfu_601SUzvM_tJ6GFBYNYZ0',
  //   hashed_secret: '$2a$05$jwR9fHz.bvvesXIsI9Wp/uv8JNKjjpbrTUnCJLxXqIzS2J/yCAHpC' }
  // ```
  // Lets create a new client that uses this new key:
  return new faunadb.Client({ domain: 'localhost', port: 8444, scheme: 'http', secret: { user: res.secret } });
}).then((client) => {
  // Now that we have a client that can access our new database, lets create a class.
  return client.query(q.create(Ref('classes'), { name: 'my_test_class' })).then((resp) => {
    var classRef = resp.ref;

    // And an index on the class to query against.
    return client.query(q.create(Ref('indexes'), { name: 'my_test_class_by_a', source: classRef, terms: [{ field: [ 'data', 'a' ] }] })).then((resp) => {
      var indexRef = resp.ref;

      // Lets add some data.
      return client.query(q.create(classRef, { data: { a: 'something' } })).then((resp) => {
        var instanceRef = resp.ref;

        // And query for it. Note that this pagination helper returns a Promise<void>; this prevents
        // large sets from being inadvertently loaded locally. The provided callback to the
        // PageHelper#eachPage and PageHelper#eachItem should have side effects if maintaining
        // state is necessary.
        return client.paginate(q.match(indexRef, 'something')).eachItem((item) => {
          // Perform some per-item logic.
          if (!item.equals(instanceRef)) { }
        });
      });
    });
  });
}).catch((ex) => {
  console.log(ex);
});
