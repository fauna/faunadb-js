import {assert} from 'chai'
import {InvalidValue} from '../lib/errors'
import {Event, FaunaDate, FaunaSet, FaunaTime, Page, Ref} from '../lib/objects'
import {parseJSON, toJSON} from '../lib/_json'
import * as query from '../lib/query'

describe('objects', () => {
  const
    ref = new Ref('classes', 'frogs', '123'),
    jsonRef = '{"@ref":"classes/frogs/123"}'

  it('ref', () => {
    assert.deepEqual(parseJSON(jsonRef), ref)
    assert.equal(toJSON(ref), jsonRef)

    const blobs = new Ref('classes', 'blobs'), blobRef = new Ref(blobs, '123')
    assert.deepEqual(blobRef.class, blobs)
    assert.equal(blobRef.id, '123')

    const keys = new Ref('keys')
    assert.deepEqual(keys.class, keys)
    assert.throws(() => keys.id, InvalidValue)

    const keyRef = new Ref(keys, '123')
    assert.deepEqual(keyRef.class, keys)
    assert.equal(keyRef.id, '123')

    // valueOf converts to string
    assert.equal('' + blobRef, 'classes/blobs/123')
  })

  it('set', () => {
    const
      index = new Ref('indexes', 'frogs_by_size'),
      jsonIndex = '{"@ref":"indexes/frogs_by_size"}',
      match = new FaunaSet(query.match(ref, index)),
      jsonMatch = `{"@set":{"match":${jsonIndex},"terms":${jsonRef}}}`
    assert.deepEqual(parseJSON(jsonMatch), match)
    assert.equal(toJSON(match), jsonMatch)
  })

  it('event', () => {
    const event_json = '{"ts":123,"action":"create","resource":{"@ref":"classes/frogs/123"}}'
    assert.equal(toJSON(new Event(123, 'create', ref)), event_json)
  })

  it('page', () => {
    const before = new Ref('instances', '123'), after = new Ref('instances', '456')
    assert.deepEqual(Page.fromRaw({data: [1], before, after}), new Page([1], before, after))
    assert.deepEqual(
      new Page([1, 2, 3], before, after).mapData((_: number) => _ + 1),
      new Page([2, 3, 4], before, after))
  })

  it('time conversion', () => {
    const dt = new Date()
    assert.deepEqual(new FaunaTime(dt).date, dt)

    const epoch = new Date(Date.UTC(1970, 0, 1))
    const ft = new FaunaTime(epoch)
    assert.deepEqual(ft, new FaunaTime('1970-01-01T00:00:00.000Z'))
    assert.deepEqual(ft.date, epoch)

    // time offset not allowed
    assert.throws(() => new FaunaTime('1970-01-01T00:00:00.000+04:00'), InvalidValue)
  })

  it('time', () => {
      const test_ts = new FaunaTime('1970-01-01T00:00:00.123456789Z')
      const test_ts_json = '{"@ts":"1970-01-01T00:00:00.123456789Z"}'
      assert.equal(toJSON(test_ts), test_ts_json)
      assert.deepEqual(parseJSON(test_ts_json), test_ts)
  })

  it('date conversion', () => {
    const now = new Date(Date.now())
    const dt = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
    assert.deepEqual(new FaunaDate(dt).date, dt)

    const epoch = new Date(Date.UTC(1970, 0, 1))
    const fd = new FaunaDate(epoch)
    assert.deepEqual(fd, new FaunaDate('1970-01-01'))
    assert.deepEqual(fd.date, epoch)
  })

  it('date', () => {
    const test_date = new FaunaDate(new Date(1970, 0, 1))
    const test_date_json = '{"@date":"1970-01-01"}'
    assert.equal(toJSON(test_date), test_date_json)
    assert.deepEqual(parseJSON(test_date_json), test_date)
  })
})
