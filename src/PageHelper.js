'use strict';

var query = require('./query');
var objectAssign = require('object-assign');
var Promise = require('es6-promise').Promise;

/**
 * A FaunaDB Lambda expression to be passed into one of the collection
 * functions: Map or Filter.
 *
 * @callback PageHelper~collectionFunction
 * @param {any} var
 *   The variable passed in by FaunaDB when this Lambda
 *   function is executed.
 * @return {Expr}
 *   The FaunaDB query expression to be returned by this Lambda.
 */

/**
 * @callback PageHelper~eachPageFunction
 * @param {Object} page
 *   A page returned by FaunaDB's Paginate function.
 */

/**
 * @callback PageHelper~eachItemFunction
 * @param {Object} item
 *   An item contained in a page returned by FaunaDB's Paginate function.
 */

/**
 * A wrapper that provides a helpful API for consuming FaunaDB pages.
 *
 * Generally this is constructed through the {@link Client#paginate} method.
 *
 * @param {Client} client
 *   The FaunaDB client used to paginate.
 * @param {Object} set
 *   The set to paginate.
 * @param {Object} params
 *   Parameters to be passed to the FaunaDB Paginate function.
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

/**
 * Wraps the set to be paginated with a FaunaDB Map function.
 * As this function is executed on the server, the `lambda` param must
 * return a valid query expression.
 *
 * @param {PageHelper~collectionFunction} lambda
 *   The Lambda expression to be passed into the Map function.
 * @return {PageHelper}
 *
 */
PageHelper.prototype.map = function(lambda) {
  var rv = this.clone();
  rv._faunaFunctions.push(function(q) { return query.map(q, lambda); });
  return rv;
};

/**
 * Wraps the set to be paginated with a FaunaDB Filter funciton.
 * As this function is executed on the server, the `lambda` param must
 * return a valid query expression.
 *
 * @param {PageHelper~collectionFunction} lambda
 *   The lambda expression to be passed into the Filter function.
 * @return {PageHelper}
 */
PageHelper.prototype.filter = function(lambda) {
  var rv = this.clone();
  rv._faunaFunctions.push(function(q) { return query.filter(q, lambda); });
  return rv;
};

/**
 * Executes the provided function for each page.
 *
 * @param {PageHelper~eachPageFunction} lambda
 *   A function to be executed for each page.
 * @returns {external:Promise.<void>}
 */
PageHelper.prototype.eachPage = function(lambda) {
  return this._nextPage(this.cursor).then(this._handlePage(lambda));
};

/**
 * Executes the provided function for each item in each page.
 *
 * @param {PageHelper~eachItemFunction} lambda
 *   A function to be executed for each item in each page.
 * @returns {external:Promise.<void>}
 */
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
 * @returns {external:Promise.<Object>}
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

/**
 * @private
 * @returns {PageHelper}
 */
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
