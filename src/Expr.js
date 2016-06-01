var FaunaObject = require('./objects').FaunaObject;

function Expr(obj) {
  this.raw = obj;
}

Expr.wrap = function(obj) {
  if (obj === null) {
    return null;
  } if (obj instanceof Expr) {
    return obj;
  } else if (obj instanceof FaunaObject) {
    return obj;
  } else if (obj instanceof Array) {
    return new Expr(obj.map(function (elem) {
      return Expr.wrap(elem);
    }));
  } else if (typeof obj === 'object') {
    return new Expr({ object: Expr.wrapValues(obj) });
  } else {
    return obj;
  }
};

Expr.wrapValues = function(obj) {
  if (obj !== null) {
    var rv = {};

    Object.keys(obj).forEach(function(key) {
      rv[key] = Expr.wrap(obj[key]);
    });

    return rv;
  } else {
    return null;
  }
};

module.exports = Expr;