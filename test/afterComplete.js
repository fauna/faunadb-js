const query = require('../src/query')
const Client = require('../src/Client')
const util = require('../src/_util')
const testConfig = require('./config')
const errors = require('../src/errors')

function takeObjectKeys(object) {
  var out = {}
  for (var i = 0; i < arguments.length; ++i) {
    var key = arguments[i]
    out[key] = object[key]
  }
  return out
}

const rootClient = new Client(
  Object.assign(
    { secret: testConfig.auth },
    util.removeUndefinedValues(
      takeObjectKeys(testConfig, 'domain', 'scheme', 'port')
    )
  )
)

rootClient
  .query(query.KeyFromSecret(testConfig.auth))
  .catch(error => {
    if (error instanceof errors.BadRequest) {
      return null
    }
    throw error
  })
  .then(rootKey =>
    rootClient.query(
      query.Let(
        {
          rootKey,
          keys: query.Map(query.Paginate(query.Keys()), ref => query.Get(ref)),
          allKeysExceptRoot: query.Map(
            rootKey
              ? query.Filter(query.Var('keys'), key =>
                  query.Not(
                    query.Equals(
                      query.Select(['ref'], key, null),
                      query.Select(['ref'], query.Var('rootKey'))
                    )
                  )
                )
              : query.Var('keys'),
            key => query.Select(['ref'], key)
          ),
          refsToRemove: query.Union(
            query.Select(['data'], query.Paginate(query.Databases())),
            query.Select(['data'], query.Paginate(query.Collections())),
            query.Select(['data'], query.Paginate(query.Indexes())),
            query.Select(['data'], query.Paginate(query.Functions())),
            query.Select(['data'], query.Var('allKeysExceptRoot'))
          ),
        },
        query.Foreach(query.Var('refsToRemove'), ref =>
          query.If(query.Exists(ref), query.Delete(ref), '')
        )
      )
    )
  )
  .catch(console.error)
