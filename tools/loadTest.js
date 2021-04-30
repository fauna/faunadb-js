const yargs = require('yargs')
const faunadb = require('../')
const testConfig = require('../test/config')
const { Client, query: Q } = faunadb

const { argv } = yargs
  .option('threads', {
    alias: 't',
    description: 'Maximum number of consequence threads',
    type: 'number',
    default: 10,
  })
  .option('queries', {
    alias: 'q',
    description: 'Maximum number of queries per each thread',
    type: 'number',
    default: 500,
  })

const getRandomInt = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)

  return Math.floor(Math.random() * (max - min + 1)) + min
}

const getRandomElement = list => list[getRandomInt(0, list.length - 1)]

const makeClient = () =>
  new Client({
    secret: testConfig.auth,
    domain: testConfig.domain,
    scheme: testConfig.scheme,
  })

const clientPool = Array.from({ length: 10 }, makeClient)

const tick = () => {
  const id = Math.random()
    .toString()
    .slice(-5)
  const requests = []

  console.log(`Running ${argv.queries} parallel queries for ${id}`)

  for (const _ of '_'.repeat(argv.queries)) {
    const client = getRandomElement(clientPool)
    const queries = [Q.Paginate(Q.Collections()), Q.Sum([1, 1])]

    requests.push(
      client.query(getRandomElement(queries)).catch(err => {
        console.error(err)
        process.exit(1)
      })
    )
  }

  Promise.all(requests).then(() =>
    console.log(`Done for ${id}. Threads ${++done}/${argv.threads}`)
  )
}

const execute = (idx = argv.threads - 1) => {
  const delay = idx === argv.threads ? 0 : getRandomInt(0, 10 * 1000)

  setTimeout(() => {
    tick()

    if (idx !== 0) {
      execute(idx - 1)
    }
  }, delay)
}

let done = 0
execute()
