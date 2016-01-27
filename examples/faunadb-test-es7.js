/*
To run this:
  cd to examples
  npm install
  npm run run-test-es7
*/

import {Class, Client, Database, Key, Model, NotFound, Ref, query} from '../index'

const rootClient = new Client({
  secret: {
    // Use your faunadb.com login here
    user: '',
    pass: ''
  }
})

async function testPing() {
  console.log(await rootClient.ping())
}

async function createDBAndGetClient() {
  const dbName = 'prydain'
  const dbRef = new Ref('databases', 'prydain')

  try {
    await rootClient.delete(dbRef)
    console.log('Deleted old db.')
  } catch (error) {
    if (error instanceof NotFound)
      console.log('No old db to delete.')
    else
      throw error
  }

  await Database.create(rootClient, {name: dbName})
  const key = await Key.create(rootClient, {database: dbRef, role: 'server'})
  return new Client({secret: {user: key.secret}})
}

async function testQuery(client) {
  console.log(`1 + 1 is ${await client.query(query.add(1, 1))}`)
}

async function testModel(client) {
  class MyModel extends Model {}
  // Set up the class name and fields of the model.
  MyModel.setup('my_model', {
    color: {}
  })
  // Create the model in the database.
  await Class.createForModel(client, MyModel)

  const instance = await MyModel.create(client, {color: 'green'})
  console.log(instance.toString())
}

async function test() {
  await testPing()
  const client = await createDBAndGetClient()
  await testQuery(client)
  await testModel(client)
}

function promiseDone(promise) {
  promise.catch(error => {
    console.log(error.stack)
  })
}

promiseDone(test())
