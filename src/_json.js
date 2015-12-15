import {FaunaDate, FaunaSet, FaunaTime, Ref} from './objects'

export function toJSON(object, pretty=false) {
  return pretty ? JSON.stringify(object, null, '  ') : JSON.stringify(object)
}

export function parseJSON(json) {
  return JSON.parse(json, json_parse)
}

function json_parse(_, val) {
  if (typeof val !== 'object' || val === null)
    return val
  else if ('@ref' in val)
    return new Ref(val['@ref'])
  else if ('@obj' in val)
    return val['@obj']
  else if ('@set' in val)
    return new FaunaSet(val['@set'])
  else if ('@ts' in val)
    return new FaunaTime(val['@ts'])
  else if ('@date' in val)
    return new FaunaDate(val['@date'])
  else
    return val
}
