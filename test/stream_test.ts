import {assert} from 'chai'
import AsyncStream from '../lib/AsyncStream'
import PageStream from '../lib/PageStream'
import * as query from '../lib/query'
import {client} from './util'

const countToFour = () =>
  AsyncStream.fromIterable([0, 1, 2, 3, 4])

describe('stream', () => {
  it('stream', async () => {
    assert.deepEqual(await countToFour().all(), [0, 1, 2, 3, 4])
  })

  it('map', async () => {
    assert.deepEqual(await countToFour().map(n => n * 2).all(), [0, 2, 4, 6, 8])
  })

  it('filter', async () => {
    assert.deepEqual(await countToFour().filter(n => n % 2 === 0).all(), [0, 2, 4])
  })

  it('takeWhile', async () => {
    assert.deepEqual(await countToFour().takeWhile(n => n < 3).all(), [0, 1, 2])
  })

  it('flatten', async () => {
    assert.deepEqual(
      await AsyncStream.fromIterable([[0, 1], [], [2, 3, 4]]).flatten().all(),
      [0, 1, 2, 3, 4])
  })

  it('flatMap', async () => {
    assert.deepEqual(
      await AsyncStream.fromIterable([0, 1, 2]).flatMap(n => [n, n]).all(),
      [0, 0, 1, 1, 2, 2])
  })

  it('page stream', async () => {
    const classRef = (await client.post('classes', {name: 'gadgets'})).ref
    const indexRef = (await client.post('indexes', {
      name: 'gadgets_by_n',
      source: classRef,
      path: 'data.n',
      active: true
    })).ref

    async function create(n: number): Promise<any> {
      const q = query.create(classRef, query.quote({data: {n}}))
      return (await client.query(q)).ref
    }

    const a = await create(0)
    await create(1)
    const b = await create(0), c = await create(0), d = await create(0)

    const gadgetsSet = query.match(indexRef, 0)

    const stream = new PageStream(client, gadgetsSet, {pageSize: 2})

    assert.deepEqual(await stream.all(), [[a, b], [c, d]])

    assert.deepEqual(
      await PageStream.elements(client, gadgetsSet, {pageSize: 2}).all(),
      [a, b, c, d])

    // Test mapLambda
    const mapStream = PageStream.elements(client, gadgetsSet, {
      pageSize: 2,
      mapLambda: a => query.select(['data', 'n'], query.get(a))
    })
    assert.deepEqual(await mapStream.all(), [0, 0, 0, 0])
  })
})
