'use strict';

var query = require('./query');
var objectAssign = require('object-assign');
var Promise = require('es6-promise').Promise;

/**
 *
 * @param {Client} client
 * @param set
 * @param params
 * @constructor
 */
function PageHelper(client, set, params) {
  if (params === undefined) {
    params = {};
  }

  this.reverse = false;
  this.params = {};
  this.cursor = undefined;
  objectAssign(this.params, params);

  if ('before' in params && 'after' in params) {
    throw 'Cursor directions "before" and "after" are exclusive.';
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
  this._faunaFunctions = [];
}

PageHelper.prototype.map = function(lambda) {
  var rv = this.clone();
  rv._faunaFunctions.push(function(q) { return query.map(q, lambda); });
  return rv;
};

PageHelper.prototype.filter = function(lambda) {
  var rv = this.clone();
  rv._faunaFunctions.push(function(q) { return query.filter(q, lambda); });
  return rv;
};

PageHelper.prototype.eachPage = function(lambda) {
  return this._nextPage(this.cursor).then(this._handlePage(lambda));
};

PageHelper.prototype.eachItem = function(lambda) {
  return this._nextPage(this.cursor).then(this._handlePage(function(page) {
    page.forEach(lambda);
  }));
};

PageHelper.prototype._handlePage = function(lambda) {
  var self = this;
  return function (page) {
    lambda(page.data);

    var nextCursor;
    if (self.reverse) {
      nextCursor = page.before;
    } else {
      nextCursor = page.after;
    }

    if (nextCursor !== undefined) {
      return self._nextPage(nextCursor).then(self._handlePage(lambda));
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
PageHelper.prototype._nextPage = function(cursor) {
  var opts = {};
  objectAssign(opts, this.params);

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

  if (this._faunaFunctions.length > 0) {
    this._faunaFunctions.forEach(function(lambda) {
      q = lambda(q);
    });
  }

  return this.client.query(q);
};

PageHelper.prototype.clone = function() {
  return Object.create(PageHelper.prototype, {
    client: { value: this.client },
    set: { value: this.set },
    _faunaFunctions: { value: this._faunaFunctions },
    reverse: { value: this.reverse },
    cursor: { value: this.cursor }
  });
};

module.exports = PageHelper;
