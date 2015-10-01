import {FaunaSet, Ref} from './objects'

export const
  toJSON = (object, pretty=false) =>
    pretty ? JSON.stringify(object, null, '  ') : JSON.stringify(object),

  parseJSON = json =>
    JSON.parse(json, json_parse)

const json_parse = (_, val) => {
  if (typeof val !== 'object' || val === null)
    return val
  else if ('@ref' in val)
    return new Ref(val['@ref'])
  else if ('@obj' in val)
    return val['@obj']
  else if ('@set' in val)
    return new FaunaSet(val['@set'])
  else
    return val
}
