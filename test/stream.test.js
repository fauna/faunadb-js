'use strict'

const Client = require('../src/Client')
const q = require('../src/query')
const util = require('./util')
const { BadRequest } = require('../src/errors')

let db, key, client, coll, doc, stream, window, fetch

describe('StreamAPI', () => {
  beforeAll(async () => {
    util.client() // initialize clients
    const cfg = util.getCfg()
    const rootClient = util.rootClient
    db = await rootClient.query(
      q.CreateDatabase({
        name: util.randomString('db'),
      })
    )
    key = await rootClient.query(
      q.CreateKey({
        database: db.ref,
        role: 'admin',
      })
    )
    client = util.getClient({
      secret: key.secret,
    })
    coll = await client.query(
      q.CreateCollection({
        name: 'stream_docs',
      })
    )
  })

  afterAll(async () => {
    await util.rootClient.query(q.Delete(db.ref))
  })

  beforeEach(async () => {
    window = global.window
    fetch = global.fetch
    doc = await client.query(
      q.Create(coll.ref, {
        data: {},
      })
    )
  })

  afterEach(() => {
    if (stream !== undefined) {
      stream.close()
    }
    global.window = window
    global.fetch = fetch
  })

  describe('stream', () => {
    test('can listen to events', done => {
      stream = client
        .stream(doc.ref)
        .on('start', (_, event) => {
          expect(event.type).toEqual('start')
          expect(typeof event.txn).toBe('number')
          expect(typeof event.event).toBe('number')
          done()
        })
        .start()
    })

    test('reject unknown events', () => {
      expect(() => client.stream(doc.ref).on('foo')).toThrow(Error)
    })

    test('can select fields', done => {
      stream = client
        .stream(doc.ref, { fields: ['diff', 'prev'] })
        .on('start', () => {
          client.query(q.Update(doc.ref, {}))
        })
        .on('version', data => {
          expect(Object.keys(data)).toEqual(['diff', 'prev'])
          done()
        })
        .start()
    })

    test('events update last seen transacton time', done => {
      stream = client
        .stream(doc.ref)
        .on('start', () => {
          client.query(q.Update(doc.ref, {}))
        })
        .on('version', (_, event) => {
          expect(client.getLastTxnTime()).toEqual(event.txn)
          done()
        })
        .start()
    })

    test('can handle request failures', done => {
      stream = client
        .stream('invalid stream')
        .on('error', err => {
          expect(err).toBeInstanceOf(BadRequest)
          done()
        })
        .start()
    })

    test('can not start an already started stream', () => {
      stream = client.stream(doc.ref).start()
      expect(() => stream.start()).toThrow(Error)
    })

    async function testErrorEvent(done, checkErrorCallback) {
      let role = await client.query(
        q.CreateRole({
          name: util.randomString('role'),
          privileges: [
            {
              resource: coll.ref,
              actions: { read: true },
            },
          ],
        })
      )
      let key = await client.query(q.CreateKey({ role: role.ref }))
      stream = util
        .getClient({ secret: key.secret })
        .stream(doc.ref)
        .on('start', async () => {
          // Force an error event by deleting the key used to start the stream,
          // then issue update to force auth revalidation.
          await client.query(q.Delete(key.ref))
          await client.query(q.Update(doc.ref, {}))
        })
        .on('error', error => {
          checkErrorCallback(error)
          done()
        })
        .start()
    }

    test('wraps error events', async done => {
      testErrorEvent(done, error => {
        if (error.code && error.description) {
          expect(error.code).toEqual('permission denied')
          expect(error.description).toEqual(
            'Authorization lost during stream evaluation.'
          )
        }
      })
    })

    test('wraps delegated error events if stream closed unexpectedly', async done => {
      testErrorEvent(done, error => {
        if (error instanceof TypeError) {
          expect(error.message).toEqual('network error')
        }
      })
    })

    test('reports to client observer', done => {
      let client = util.getClient({
        secret: key.secret,
        observer: result => {
          expect(result.responseRaw).toEqual('[stream]')
          expect(result.responseContent).toEqual('[stream]')
          done()
        },
      })
      stream = client.stream(doc.ref).start()
    })

    test('use client fetch override if available', done => {
      let client = util.getClient({
        fetch: () => Promise.reject(new Error('client fetch used')),
      })
      stream = client
        .stream(doc.ref)
        .on('error', error => {
          expect(error.message).toEqual('client fetch used')
          done()
        })
        .start()
    })

    test('override fetch polyfill if possible', done => {
      global.fetch = () => Promise.reject(new Error('global fetch called'))
      util.simulateBrowser()

      // Re-initiate the client in order to re-initiate underlying
      // HttpClient's adapter and pull new fetch API from global.
      const client = util.getClient()

      stream = client
        .stream(doc.ref)
        .on('error', error => {
          expect(error.message).toEqual('global fetch called')
          done()
        })
        .start()
    })

    test('report failure if no fetch compatible function is found', done => {
      util.simulateBrowser()

      // Re-initiate the client in order to re-initiate underlying
      // HttpClient's adapter and pull new fetch API from global.
      const client = util.getClient({
        secret: key.secret,
      })

      stream = client
        .stream(doc.ref)
        .on('error', error => {
          expect(error.message).toEqual('streams not supported')
          expect(error.description).toMatch(
            /Please, consider providing a Fetch API-compatible function/
          )
          done()
        })
        .start()
    })

    test('report failure if failed to read a stream', done => {
      util.simulateBrowser()
      let client = util.getClient({
        // Mock the HTTP response and return a null body to force an error
        // during stream data read.
        fetch: () =>
          Promise.resolve({
            ok: true,
            headers: {
              has: () => false,
              entries: () => [],
            },
          }),
      })
      stream = client
        .stream(doc.ref)
        .on('error', error => {
          expect(error.message).toEqual('streams not supported')
          expect(error.description).toMatch(
            /Please, consider providing a Fetch API-compatible function/
          )
          done()
        })
        .start()
    })

    test('can listen to large events', done => {
      var arr = []
      for (let i = 0; i < 4096; i++) {
        // at least 4KB
        arr.push({ value: i.toString() })
      }

      stream = client
        .stream(doc.ref)
        .on('start', () => {
          client.query(
            q.Update(doc.ref, {
              data: {
                values: arr,
              },
            })
          )
        })
        .on('version', evt => {
          expect(evt.document.data.values).toEqual(arr)
          done()
        })
        .start()
    })
  })

  describe('document', () => {
    test('can take snapshot before processing events', done => {
      stream = client.stream
        .document(doc.ref)
        .on('snapshot', snapshot => {
          expect(snapshot.data).toEqual(doc.data)
          done()
        })
        .start()
    })

    test('filter buffered events prior to snapshot', done => {
      let fetch = require('cross-fetch')
      let buffering = false

      // Allow the test to inject an event between stream subscription and the
      // snapshot request so it excercises the internal buffers.
      async function fetchWrapper() {
        if (!buffering) {
          return fetch.apply(null, arguments)
        } else {
          buffering = false
          await client.query(q.Update(doc.ref, {}))
          return fetchWrapper.apply(null, arguments)
        }
      }

      let snapshot

      stream = util
        .getClient({ secret: key.secret, fetch: fetchWrapper })
        .stream.document(doc.ref)
        .on('start', () => {
          buffering = true
        })
        .on('snapshot', doc => {
          snapshot = doc
          client.query(q.Update(doc.ref, {}))
        })
        .on('version', (_, event) => {
          expect(event.txn).toBeGreaterThanOrEqual(snapshot.ts)
          done()
        })
        .start()
    })

    test('report failure during snapshot', done => {
      // Non-existing ref should fail to run q.Get(..).
      let ref = q.Ref(coll.ref, 1234)
      stream = client.stream
        .document(ref)
        .on('snapshot', snapshot => {})
        .on('error', error => {
          expect(error.name).toEqual('NotFound')
          done()
        })
        .start()
    })

    test('close http2 session when the .close method is called', async () => {
      const idleTime = 500
      const client = util.getClient({
        secret: key.secret,
        http2SessionIdleTime: idleTime,
      })

      const assertActiveSessions = length =>
        expect(Object.keys(client._http._adapter._sessionMap).length).toBe(
          length
        )

      stream = client.stream.document(doc.ref).start()

      await new Promise(resolve => {
        stream.on('snapshot', () => resolve())
      })
      await util.delay(idleTime + 1)

      assertActiveSessions(1)

      stream.close()

      await util.delay(idleTime + 1)

      assertActiveSessions(0)
    })
  })
})
