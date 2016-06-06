'use strict';

var query = require('./query');

/**
 *
 * @param {Client} client
 * @param set
 * @constructor
 */
function Page(client, set) {
  this.client = client;
  this.set = set;
  /**
   * @member {Array.<Function>}
   * @type {Array.<Function>}
   * @private
   */
  this._fauna_functions = [];
}

Page.prototype.map = function(lambda) {
  var rv = this.clone();
  rv._fauna_functions.push(function(q) { return query.map(q, lambda) });
  return rv;
};

Page.prototype.filter = function(lambda) {
  var rv = this.clone();
  rv._fauna_functions.push(function(q) { return query.filter(q, lambda) });
  return rv;
};

Page.prototype.iterator = function() {
  
};

Page.prototype.each = function(lambda) {
  return this._next_page().then(this._handle_page(lambda));
};

Page.prototype._handle_page = function(lambda) {
  var self = this;
  return function (page) {
    lambda(page.data);

    if (page.after !== undefined) {
      return self._next_page(page.after).then(self._handle_page(lambda));
    } else {
      return Promise.resolve();
    }
  };
};

/**
 *
 * @returns {Promise.<Object>}
 * @private
 */
Page.prototype._next_page = function(cursor) {
  var opts = {};
  if (cursor !== undefined) {
    opts.after = cursor;
  }

  // TODO: ADD PARAMS
  var q = query.paginate(this.set, opts);

  if (this._fauna_functions.length > 0) {
    this._fauna_functions.forEach(function(lambda) {
      q = lambda(q);
    });
  }

  return this.client.query(q);
};

Page.prototype.clone = function() {
  return Object.create(Page.prototype, {
    client: { value: this.client },
    set: { value: this.set },
    _fauna_functions: { value: this._fauna_functions }
  });
};

module.exports = Page;
