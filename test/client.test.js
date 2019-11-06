'use strict'

var errors = require('../src/errors')
var query = require('../src/query')
var util = require('./util')

var client

describe('Client', () => {
  beforeAll(() => {
    // Hideous way to ensure that the client is initialized.
    client = util.client()

    return client.query(query.CreateCollection({ name: 'my_collection' }))
  })

  test('invalid key', () => {
    var badClient = util.getClient({ secret: { user: 'bad_key' } })
    return util.assertRejected(badClient.query(util.dbRef), errors.Unauthorized)
  })

  test('ping', () => {
    return client.ping('node').then(function(res) {
      expect(res).toEqual('Scope node is OK')
    })
  })

  test('paginates', () => {
    return createDocument().then(function(document) {
      return client.paginate(document.ref).each(function(page) {
        page.forEach(function(i) {
          expect(document.ref).toEqual(i)
        })
      })
    })
  })

  test('updates the last txntime for a query', () => {
    var firstSeen = client.getLastTxnTime()

    var pEcho = client.query(42).then(function() {
      expect(client.getLastTxnTime()).toBeGreaterThanOrEqual(firstSeen)
    })

    var pCreate = client
      .query(query.CreateCollection({ name: 'foo_collection' }))
      .then(function(res) {
        expect(client.getLastTxnTime()).toBeGreaterThan(firstSeen)
      })

    return Promise.all([pEcho, pCreate])
  })

  test('manually updates the last txntime for a bigger time', () => {
    var firstSeen = client.getLastTxnTime()

    client.syncLastTxnTime(firstSeen - 1200)
    expect(firstSeen).toEqual(client.getLastTxnTime())

    var lastSeen = firstSeen + 1200
    client.syncLastTxnTime(lastSeen)
    expect(lastSeen).toEqual(client.getLastTxnTime())
  })

  test('extract response headers from observer', () => {
    var assertResults = function(result) {
      assertHeader(result.responseHeaders, 'x-read-ops')
      assertHeader(result.responseHeaders, 'x-write-ops')
      assertHeader(result.responseHeaders, 'x-storage-bytes-read')
      assertHeader(result.responseHeaders, 'x-storage-bytes-write')
      assertHeader(result.responseHeaders, 'x-query-bytes-in')
      assertHeader(result.responseHeaders, 'x-query-bytes-out')

      expect(result.endTime).toBeGreaterThan(result.startTime)
    }

    var observedClient = util.getClient({ observer: assertResults })

    return observedClient.query(
      query.CreateCollection({ name: 'bar_collection' })
    )
  })

  test('keeps connection alive', () => {
    var aliveClient = util.getClient({ keepAlive: true })
    var p1 = expect(aliveClient._keepAliveEnabledAgent).not.toEqual(undefined)
    var notAliveClient = util.getClient({ keepAlive: false })
    var p2 = expect(notAliveClient._keepAliveEnabledAgent).toEqual(undefined)

    return Promise.all([p1, p2])
  })

  test('sets authorization header per query', async function() {
    const resultWithoutOptions = await client.query(query.Do(1))
    const resultWithOptions = await client.query(query.Do(1), {
      secret: util.clientSecret,
    })

    return expect(resultWithoutOptions).toEqual(resultWithOptions)
  })

  test('sets authorization header per paginate', async function() {
    const resultWithoutOptions = await client
      .paginate(query.Collections())
      .nextPage()
    const resultWithOptions = await client
      .paginate(query.Collections(), null, {
        secret: util.clientSecret,
      })
      .nextPage()

    return expect(resultWithoutOptions).toEqual(resultWithOptions)
  })
})

function assertHeader(headers, name) {
  expect(headers[name]).not.toBeNull()
  expect(parseInt(headers[name])).toBeGreaterThanOrEqual(0)
}

function createDocument() {
  return client.query(query.Create(query.Collection('my_collection'), {}))
}
