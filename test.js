const fauna = require('./index')

const client = new fauna.Client({
  secret: 'fnAEP7oykPACDAEJSCI9W3WLwjgcoGeO1jrVyrHk',
})

client
  .query(fauna.Create(fauna.Call))
  .then(console.info)
  .catch(error => {
    console.info(error)
  })
