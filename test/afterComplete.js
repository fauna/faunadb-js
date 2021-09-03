const query = require('../src/query')
const Client = require('../src/Client')
const testConfig = require('./config')

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
rootClient.query(
  query.Let(
    {
      rootKey: query.KeyFromSecret(testConfig.auth),
      keys: query.Map(query.Paginate(query.Keys()), ref => query.Get(ref)),
      allKeysExceptRoot: query.Map(
        query.Filter(query.Var('keys'), key =>
          query.Not(
            query.Equals(
              query.Select(['ref'], key, null),
              query.Select(['ref'], query.Var('rootKey'))
            )
          )
        ),
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
