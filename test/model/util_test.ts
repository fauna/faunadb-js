import {assert} from 'chai'
import {calculateDiff, getPath, objectDup, setPath} from '../../lib/model/_util'

describe('model/_util', () => {
  it('dup', () => {
    const orig = {a: 1, b: 2}
    const copy = objectDup(orig)
    assert.deepEqual(copy, orig)
    assert.notEqual(copy, orig)
  })

  it('getPath', () => {
    assert.equal(getPath(['a', 'b', 'c'], {a: {b: {c: 1}}}), 1)
    assert.equal(getPath(['x', 'y', 'z'], {x: {y: 1}}), null)
  })

  it('setPath', () => {
    const data = {}
    setPath(['a', 'b'], 1, data)
    assert.deepEqual(data, {a: {b: 1}})
  })

  it('diff', () => {
    assert.deepEqual(calculateDiff({a: 1, b: 2}, {a: 1, b: 2}), {})
    assert.deepEqual(calculateDiff({a: 1}, {a: 2}), {a: 2})
    assert.deepEqual(calculateDiff({a: 1}, {a: 1, b: 2}), {b: 2})
    assert.deepEqual(calculateDiff({a: 1, b: 2}, {a: 1}), {b: null})
  })
})
