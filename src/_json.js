'use strict';

var values = require('./values');

function toJSON(object, pretty) {
  pretty = typeof pretty !== 'undefined' ? pretty : false;

  if (pretty) {
    return JSON.stringify(object, null, '  ');
  } else {
    return JSON.stringify(object);
  }
}

function parseJSON(json) {
  return JSON.parse(json, json_parse);
}

function json_parse(_, val) {
  if (typeof val !== 'object' || val === null) {
    return val;
  } else if ('@ref' in val) {
    var ref = val['@ref'];

    if (typeof ref === 'string') {
      var parts = ref.split('/');

      var ref_parsed = values.Native.fromName(parts[0]);

      if (parts.length > 1) {
        ref_parsed = new values.Ref(parts[1], ref_parsed);
      }

      if (parts.length > 2) {
        ref_parsed = new values.Ref(parts[2], ref_parsed);
      }

      return ref_parsed;
    }

    if (!('class' in ref) && !('database' in ref)) {
      return values.Native.fromName(ref['id']);
    }

    var cls = json_parse('class', ref['class']);
    var db = json_parse('database', ref['database']);

    return new values.Ref(ref['id'], cls, db);
  } else if ('@obj' in val) {
    return val['@obj'];
  } else if ('@set' in val) {
    return new values.SetRef(val['@set']);
  } else if ('@ts' in val) {
    return new values.FaunaTime(val['@ts']);
  } else if ('@date' in val) {
    return new values.FaunaDate(val['@date']);
  } else if ('@bytes' in val) {
    return new values.Bytes(val['@bytes']);
  } else if ('@query' in val) {
    return new values.Query(val['@query']);
  } else {
    return val;
  }
}

module.exports = {
  toJSON: toJSON,
  parseJSON: parseJSON
};
