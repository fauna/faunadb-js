'use strict';

var query = require('./query');
var objectAssign = require('object-assign');

/**
 *
 * @param {Client} client
 * @param set
 * @param params
 * @constructor
 */
function Page(client, set, params) {
  if (params === undefined) {
    params = {};
  }

  this.reverse = false;
  this.params = {};
  this.cursor = undefined;
  objectAssign(this.params, params);

  if ('before' in params && 'after' in params) {
    throw "Cursor directions 'before' and 'after' are exclusive.";
  }

  if ('before' in params) {
    this.cursor = params.before;
    this.reverse = true;

    delete this.params.before;
  } else if ('after' in params) {
    this.cursor = params.after;

    delete this.params.after;
  }

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

Page.prototype.each = function(lambda) {
  return this._next_page(this.cursor).then(this._handle_page(lambda));
};

Page.prototype._handle_page = function(lambda) {
  var self = this;
  return function (page) {
    lambda(page.data);

    var next_cursor;
    if (self.reverse) {
      next_cursor = page.before;
    } else {
      next_cursor = page.after;
    }

    if (next_cursor !== undefined) {
      return self._next_page(next_cursor).then(self._handle_page(lambda));
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
    if (this.reverse) {
      opts.before = cursor;
    } else {
      opts.after = cursor;
    }
  } else {
    if (this.reverse) {
      opts.before = null;
    }
  }

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
    _fauna_functions: { value: this._fauna_functions },
    reverse: { value: this.reverse },
    cursor: { value: this.cursor }
  });
};

module.exports = Page;
