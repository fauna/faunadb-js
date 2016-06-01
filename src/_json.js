var Expr = require('./Expr');
var objects = require('./objects');

function toJSON(object, pretty) {
  pretty = typeof pretty !== 'undefined' ? pretty : false;

  if (pretty) {
    return JSON.stringify(object, _unwrap, '  ');
  } else {
    return JSON.stringify(object, _unwrap);
  }
}

function parseJSON(json) {
  return JSON.parse(json, json_parse);
}

function json_parse(_, val) {
  if (typeof val !== 'object' || val === null) {
    return val;
  } else if ('@ref' in val) {
    return new objects.Ref(val['@ref']);
  } else if ('@obj' in val) {
    return val['@obj'];
  } else if ('@set' in val) {
    return new objects.SetRef(val['@set']);
  } else if ('@ts' in val) {
    return new objects.FaunaTime(val['@ts']);
  } else if ('@date' in val) {
    return new objects.FaunaDate(val['@date']);
  } else {
    return val;
  }
}

function _unwrap(_, value) {
  if (value instanceof Expr) {
    return value.raw;
  } else {
    return value;
  }
}

module.exports = {
  toJSON: toJSON,
  parseJSON: parseJSON
};
