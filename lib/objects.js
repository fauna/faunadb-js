'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Set = require('babel-runtime/core-js/set')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _errors = require('./errors');

/**
 * FaunaDB ref.
 * See the [docs](https://faunadb.com/documentation/queries#values-special_types).
 *
 * A simple wrapper around a string which can be extracted using `ref.value`.
 * Queries that require a Ref will not work if you just pass in a string.
 */

var Ref = (function () {
  /**
   * Create a Ref from a string, such as `new Ref('databases/prydain')`.
   * Can also call `new Ref('databases', 'prydain')` or `new Ref(new Ref('databases'), 'prydain').
   */

  function Ref() {
    _classCallCheck(this, Ref);

    var parts = Array.prototype.slice.call(arguments);
    /** Raw string value. */
    this.value = parts.join('/');
  }

  /**
   * FaunaDB Set.
   * This represents a set returned as part of a response.
   * This looks like This looks like `{"@set": set_query}`.
   * For query sets see {@link match}, {@link union},
   * {@link intersection}, {@link difference}, and {@link join}.
   */

  /**
   * Gets the class part out of the Ref.
   * This is done by removing the id.
   * So `new Ref('a', 'b/c').class` will be `new Ref('a/b')`.
   */

  _createClass(Ref, [{
    key: 'toJSON',

    /** @ignore */
    value: function toJSON() {
      return { '@ref': this.value };
    }

    /** @ignore */
  }, {
    key: 'toString',
    value: function toString() {
      return this.value;
    }

    /** @ignore */
  }, {
    key: 'valueOf',
    value: function valueOf() {
      return this.value;
    }

    /** @ignore */
  }, {
    key: 'inspect',
    value: function inspect() {
      return 'Ref(' + JSON.stringify(this.value) + ')';
    }

    /** Whether these are both Refs and have the same value. */
  }, {
    key: 'equals',
    value: function equals(other) {
      return other instanceof Ref && this.value === other.value;
    }
  }, {
    key: 'class',
    get: function get() {
      var parts = this.value.split('/');
      if (parts.length === 1) return this;else return new Ref(parts.slice(0, parts.length - 1).join('/'));
    }

    /**
     * Removes the class part of the Ref, leaving only the id.
     * this is everything after the last `/`.
     */
  }, {
    key: 'id',
    get: function get() {
      var parts = this.value.split('/');
      if (parts.length === 1) throw new _errors.InvalidValue('The Ref does not have an id.');
      return parts[parts.length - 1];
    }
  }]);

  return Ref;
})();

exports.Ref = Ref;

var FaunaSet = (function () {
  function FaunaSet(query) {
    _classCallCheck(this, FaunaSet);

    /** Raw query object. */
    this.query = query;
  }

  /**
   * FaunaDB Event.
   * See the [docs](https://faunadb.com/documentation/queries#values).
   */

  /** @ignore */

  _createClass(FaunaSet, [{
    key: 'inspect',
    value: function inspect() {
      return 'FaunaSet(' + JSON.stringify(this.value) + ')';
    }

    /** @ignore */
  }, {
    key: 'toJSON',
    value: function toJSON() {
      return { '@set': this.query };
    }
  }]);

  return FaunaSet;
})();

exports.FaunaSet = FaunaSet;

var Event = (function () {
  _createClass(Event, null, [{
    key: 'fromRaw',

    /**
     * Events are not automatically converted.
     * Use this on an object that you know represents an Event.
     */
    value: function fromRaw(object) {
      return new Event(object.ts, object.action, object.resource);
    }
  }]);

  function Event(ts, action, resource) {
    _classCallCheck(this, Event);

    /** Microsecond UNIX timestamp at which the event occured. */
    this.ts = ts;
    if (!allowed_event_actions.has(action)) throw new _errors.InvalidQuery('Action must be create or delete or null.');
    if (action !== null)
      /** 'create' or 'delete' */
      this.action = action;
    if (resource !== null)
      /** The {@link Ref} of the affected instance. */
      this.resource = resource;
  }

  return Event;
})();

exports.Event = Event;

var allowed_event_actions = new _Set([null, 'create', 'delete']);

/**
 * A single pagination result.
 * See `paginate` in the [docs](https://faunadb.com/documentation/queries#read_functions).
 */

var Page = (function () {
  _createClass(Page, null, [{
    key: 'fromRaw',

    /** Use this on an object that you know represents a Page. */
    value: function fromRaw(object) {
      return new Page(object.data, object.before, object.after);
    }
  }]);

  function Page(data, before, after) {
    _classCallCheck(this, Page);

    /**
     * Always a list.
     * Elements could be raw data; some methods may convert data.
     */
    this.data = data;
    /** Optional {@link Ref} for an instance that comes before this page. */
    this.before = before;
    /** Optional {@link Ref} for an instance that comes after this page. */
    this.after = after;
  }

  /** Return a new Page whose data has had `func` applied to each element. */

  _createClass(Page, [{
    key: 'mapData',
    value: function mapData(func) {
      return new Page(this.data.map(func), this.before, this.after);
    }
  }]);

  return Page;
})();

exports.Page = Page;
//# sourceMappingURL=data:application/json;base64,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QUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO0FBQ3RCLFFBQUksUUFBUSxLQUFLLElBQUk7O0FBRW5CLFVBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO0dBQzNCOztTQXBCVSxLQUFLOzs7OztBQXNCbEIsSUFBTSxxQkFBcUIsR0FBRyxTQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFBOzs7Ozs7O0lBTXBELElBQUk7ZUFBSixJQUFJOzs7O1dBRUQsaUJBQUMsTUFBTSxFQUFFO0FBQ3JCLGFBQU8sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUMxRDs7O0FBRVUsV0FOQSxJQUFJLENBTUgsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUU7MEJBTnRCLElBQUk7Ozs7OztBQVdiLFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBOztBQUVoQixRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTs7QUFFcEIsUUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUE7R0FDbkI7Ozs7ZUFoQlUsSUFBSTs7V0FtQlIsaUJBQUMsSUFBSSxFQUFFO0FBQ1osYUFBTyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtLQUM5RDs7O1NBckJVLElBQUkiLCJmaWxlIjoib2JqZWN0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW52YWxpZFF1ZXJ5LCBJbnZhbGlkVmFsdWV9IGZyb20gJy4vZXJyb3JzJ1xuXG4vKipcbiAqIEZhdW5hREIgcmVmLlxuICogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjdmFsdWVzLXNwZWNpYWxfdHlwZXMpLlxuICpcbiAqIEEgc2ltcGxlIHdyYXBwZXIgYXJvdW5kIGEgc3RyaW5nIHdoaWNoIGNhbiBiZSBleHRyYWN0ZWQgdXNpbmcgYHJlZi52YWx1ZWAuXG4gKiBRdWVyaWVzIHRoYXQgcmVxdWlyZSBhIFJlZiB3aWxsIG5vdCB3b3JrIGlmIHlvdSBqdXN0IHBhc3MgaW4gYSBzdHJpbmcuXG4gKi9cbmV4cG9ydCBjbGFzcyBSZWYge1xuICAvKipcbiAgICogQ3JlYXRlIGEgUmVmIGZyb20gYSBzdHJpbmcsIHN1Y2ggYXMgYG5ldyBSZWYoJ2RhdGFiYXNlcy9wcnlkYWluJylgLlxuICAgKiBDYW4gYWxzbyBjYWxsIGBuZXcgUmVmKCdkYXRhYmFzZXMnLCAncHJ5ZGFpbicpYCBvciBgbmV3IFJlZihuZXcgUmVmKCdkYXRhYmFzZXMnKSwgJ3ByeWRhaW4nKS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGNvbnN0IHBhcnRzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICAgIC8qKiBSYXcgc3RyaW5nIHZhbHVlLiAqL1xuICAgIHRoaXMudmFsdWUgPSBwYXJ0cy5qb2luKCcvJylcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBjbGFzcyBwYXJ0IG91dCBvZiB0aGUgUmVmLlxuICAgKiBUaGlzIGlzIGRvbmUgYnkgcmVtb3ZpbmcgdGhlIGlkLlxuICAgKiBTbyBgbmV3IFJlZignYScsICdiL2MnKS5jbGFzc2Agd2lsbCBiZSBgbmV3IFJlZignYS9iJylgLlxuICAgKi9cbiAgZ2V0IGNsYXNzKCkge1xuICAgIGNvbnN0IHBhcnRzID0gdGhpcy52YWx1ZS5zcGxpdCgnLycpXG4gICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMSlcbiAgICAgIHJldHVybiB0aGlzXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIG5ldyBSZWYocGFydHMuc2xpY2UoMCwgcGFydHMubGVuZ3RoIC0gMSkuam9pbignLycpKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgdGhlIGNsYXNzIHBhcnQgb2YgdGhlIFJlZiwgbGVhdmluZyBvbmx5IHRoZSBpZC5cbiAgICogdGhpcyBpcyBldmVyeXRoaW5nIGFmdGVyIHRoZSBsYXN0IGAvYC5cbiAgICovXG4gIGdldCBpZCgpIHtcbiAgICBjb25zdCBwYXJ0cyA9IHRoaXMudmFsdWUuc3BsaXQoJy8nKVxuICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpXG4gICAgICB0aHJvdyBuZXcgSW52YWxpZFZhbHVlKCdUaGUgUmVmIGRvZXMgbm90IGhhdmUgYW4gaWQuJylcbiAgICByZXR1cm4gcGFydHNbcGFydHMubGVuZ3RoIC0gMV1cbiAgfVxuXG4gIC8qKiBAaWdub3JlICovXG4gIHRvSlNPTigpIHtcbiAgICByZXR1cm4geydAcmVmJzogdGhpcy52YWx1ZX1cbiAgfVxuXG4gIC8qKiBAaWdub3JlICovXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiB0aGlzLnZhbHVlXG4gIH1cblxuICAvKiogQGlnbm9yZSAqL1xuICB2YWx1ZU9mKCkge1xuICAgIHJldHVybiB0aGlzLnZhbHVlXG4gIH1cblxuICAvKiogQGlnbm9yZSAqL1xuICBpbnNwZWN0KCkge1xuICAgIHJldHVybiBgUmVmKCR7SlNPTi5zdHJpbmdpZnkodGhpcy52YWx1ZSl9KWBcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZXNlIGFyZSBib3RoIFJlZnMgYW5kIGhhdmUgdGhlIHNhbWUgdmFsdWUuICovXG4gIGVxdWFscyhvdGhlcikge1xuICAgIHJldHVybiBvdGhlciBpbnN0YW5jZW9mIFJlZiAmJiB0aGlzLnZhbHVlID09PSBvdGhlci52YWx1ZVxuICB9XG59XG5cbi8qKlxuICogRmF1bmFEQiBTZXQuXG4gKiBUaGlzIHJlcHJlc2VudHMgYSBzZXQgcmV0dXJuZWQgYXMgcGFydCBvZiBhIHJlc3BvbnNlLlxuICogVGhpcyBsb29rcyBsaWtlIFRoaXMgbG9va3MgbGlrZSBge1wiQHNldFwiOiBzZXRfcXVlcnl9YC5cbiAqIEZvciBxdWVyeSBzZXRzIHNlZSB7QGxpbmsgbWF0Y2h9LCB7QGxpbmsgdW5pb259LFxuICoge0BsaW5rIGludGVyc2VjdGlvbn0sIHtAbGluayBkaWZmZXJlbmNlfSwgYW5kIHtAbGluayBqb2lufS5cbiAqL1xuZXhwb3J0IGNsYXNzIEZhdW5hU2V0IHtcbiAgY29uc3RydWN0b3IocXVlcnkpIHtcbiAgICAvKiogUmF3IHF1ZXJ5IG9iamVjdC4gKi9cbiAgICB0aGlzLnF1ZXJ5ID0gcXVlcnlcbiAgfVxuXG4gIC8qKiBAaWdub3JlICovXG4gIGluc3BlY3QoKSB7XG4gICAgcmV0dXJuIGBGYXVuYVNldCgke0pTT04uc3RyaW5naWZ5KHRoaXMudmFsdWUpfSlgXG4gIH1cblxuICAvKiogQGlnbm9yZSAqL1xuICB0b0pTT04oKSB7XG4gICAgcmV0dXJuIHsnQHNldCc6IHRoaXMucXVlcnl9XG4gIH1cbn1cblxuLyoqXG4gKiBGYXVuYURCIEV2ZW50LlxuICogU2VlIHRoZSBbZG9jc10oaHR0cHM6Ly9mYXVuYWRiLmNvbS9kb2N1bWVudGF0aW9uL3F1ZXJpZXMjdmFsdWVzKS5cbiAqL1xuZXhwb3J0IGNsYXNzIEV2ZW50IHtcbiAgLyoqXG4gICAqIEV2ZW50cyBhcmUgbm90IGF1dG9tYXRpY2FsbHkgY29udmVydGVkLlxuICAgKiBVc2UgdGhpcyBvbiBhbiBvYmplY3QgdGhhdCB5b3Uga25vdyByZXByZXNlbnRzIGFuIEV2ZW50LlxuICAgKi9cbiAgc3RhdGljIGZyb21SYXcob2JqZWN0KSB7XG4gICAgcmV0dXJuIG5ldyBFdmVudChvYmplY3QudHMsIG9iamVjdC5hY3Rpb24sIG9iamVjdC5yZXNvdXJjZSlcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHRzLCBhY3Rpb24sIHJlc291cmNlKSB7XG4gICAgLyoqIE1pY3Jvc2Vjb25kIFVOSVggdGltZXN0YW1wIGF0IHdoaWNoIHRoZSBldmVudCBvY2N1cmVkLiAqL1xuICAgIHRoaXMudHMgPSB0c1xuICAgIGlmICghYWxsb3dlZF9ldmVudF9hY3Rpb25zLmhhcyhhY3Rpb24pKVxuICAgICAgdGhyb3cgbmV3IEludmFsaWRRdWVyeSgnQWN0aW9uIG11c3QgYmUgY3JlYXRlIG9yIGRlbGV0ZSBvciBudWxsLicpXG4gICAgaWYgKGFjdGlvbiAhPT0gbnVsbClcbiAgICAgIC8qKiAnY3JlYXRlJyBvciAnZGVsZXRlJyAqL1xuICAgICAgdGhpcy5hY3Rpb24gPSBhY3Rpb25cbiAgICBpZiAocmVzb3VyY2UgIT09IG51bGwpXG4gICAgICAvKiogVGhlIHtAbGluayBSZWZ9IG9mIHRoZSBhZmZlY3RlZCBpbnN0YW5jZS4gKi9cbiAgICAgIHRoaXMucmVzb3VyY2UgPSByZXNvdXJjZVxuICB9XG59XG5jb25zdCBhbGxvd2VkX2V2ZW50X2FjdGlvbnMgPSBuZXcgU2V0KFtudWxsLCAnY3JlYXRlJywgJ2RlbGV0ZSddKVxuXG4vKipcbiAqIEEgc2luZ2xlIHBhZ2luYXRpb24gcmVzdWx0LlxuICogU2VlIGBwYWdpbmF0ZWAgaW4gdGhlIFtkb2NzXShodHRwczovL2ZhdW5hZGIuY29tL2RvY3VtZW50YXRpb24vcXVlcmllcyNyZWFkX2Z1bmN0aW9ucykuXG4gKi9cbmV4cG9ydCBjbGFzcyBQYWdlIHtcbiAgLyoqIFVzZSB0aGlzIG9uIGFuIG9iamVjdCB0aGF0IHlvdSBrbm93IHJlcHJlc2VudHMgYSBQYWdlLiAqL1xuICBzdGF0aWMgZnJvbVJhdyhvYmplY3QpIHtcbiAgICByZXR1cm4gbmV3IFBhZ2Uob2JqZWN0LmRhdGEsIG9iamVjdC5iZWZvcmUsIG9iamVjdC5hZnRlcilcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGRhdGEsIGJlZm9yZSwgYWZ0ZXIpIHtcbiAgICAvKipcbiAgICAgKiBBbHdheXMgYSBsaXN0LlxuICAgICAqIEVsZW1lbnRzIGNvdWxkIGJlIHJhdyBkYXRhOyBzb21lIG1ldGhvZHMgbWF5IGNvbnZlcnQgZGF0YS5cbiAgICAgKi9cbiAgICB0aGlzLmRhdGEgPSBkYXRhXG4gICAgLyoqIE9wdGlvbmFsIHtAbGluayBSZWZ9IGZvciBhbiBpbnN0YW5jZSB0aGF0IGNvbWVzIGJlZm9yZSB0aGlzIHBhZ2UuICovXG4gICAgdGhpcy5iZWZvcmUgPSBiZWZvcmVcbiAgICAvKiogT3B0aW9uYWwge0BsaW5rIFJlZn0gZm9yIGFuIGluc3RhbmNlIHRoYXQgY29tZXMgYWZ0ZXIgdGhpcyBwYWdlLiAqL1xuICAgIHRoaXMuYWZ0ZXIgPSBhZnRlclxuICB9XG5cbiAgLyoqIFJldHVybiBhIG5ldyBQYWdlIHdob3NlIGRhdGEgaGFzIGhhZCBgZnVuY2AgYXBwbGllZCB0byBlYWNoIGVsZW1lbnQuICovXG4gIG1hcERhdGEoZnVuYykge1xuICAgIHJldHVybiBuZXcgUGFnZSh0aGlzLmRhdGEubWFwKGZ1bmMpLCB0aGlzLmJlZm9yZSwgdGhpcy5hZnRlcilcbiAgfVxufVxuIl19