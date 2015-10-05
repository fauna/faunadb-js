import {assert} from 'chai'
import {InvalidValue} from '../src/errors'
import {Event, Page, Ref, FaunaSet} from '../src/objects'
import {parseJSON, toJSON} from '../src/_json'
import * as query from '../src/query'

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
      jsonMatch = `{"@set":{"match":${jsonRef},"index":${jsonIndex}}}`
    assert.deepEqual(parseJSON(jsonMatch), match)
    assert.equal(toJSON(match), jsonMatch)
  })

  it('event', () => {
    assert.equal(toJSON(new Event(123, null, null)), '{"ts":123}')
    const event_json = '{"ts":123,"action":"create","resource":{"@ref":"classes/frogs/123"}}'
    assert.equal(toJSON(new Event(123, 'create', ref)), event_json)
  })

  it('page', () => {
    assert.deepEqual(Page.fromRaw({data: 1, before: 2, after: 3}), new Page(1, 2, 3))
    assert.deepEqual(new Page([1, 2, 3], 2, 3).mapData(_ => _ + 1), new Page([2, 3, 4], 2, 3))
  })
})
