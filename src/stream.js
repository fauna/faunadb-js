'use strict'

/** @module stream */

// NOTE: Although implemented in a separate module, streaming shares internal
// responsibilities with both Client and HTTP interfaces, such as updating last
// seen transaction timestamp, and determining if the fetch function set in the
// client is appropriate for the current runtime. Therefore, this implementation
// sometimes breaks encapsulation and calls internal getters and methods. As a
// general rule: it's okay to call internal methods. You can interpret this
// as calling for a package visible method in languages with fine-grained
// visibility control. However, DO NOT change any internal state from outside of
// its context as it'd most certainly lead to errors.

var AbortController = require('abort-controller')
var RequestResult = require('./RequestResult')
var errors = require('./errors')
var http = require('./_http')
var json = require('./_json')
var q = require('./query')
var util = require('./_util')

var DefaultEvents = ['start', 'error', 'version', 'history_rewrite']
var DocumentStreamEvents = DefaultEvents.concat(['snapshot'])

/**
 * The internal stream client interface. This class handles the network side of
 * a stream subscription. This implementation is environment aware. It attempts
 * to use the native `fetch` API on browsers, while relying on the underlying
 * `cross-fetch` polyfill from {@link Client} on NodeJS.
 *
 * Known limitations:
 * * NodeJS uses HTTP1;
 * * Only modern browsers are supported.
 *
 * @constructor
 * @param {Client} client The FaunaDB client.
 * @param {module:query~ExprArg} expression The FQL expression you are subscribing to.
 * @param {module:stream~Options} options The stream options.
 * @param {function} onEvent The stream event's callback function.
 * @private
 */
function StreamClient(client, expression, options, onEvent) {
  options = util.applyDefaults(options, {
    fields: null,
  })

  this._client = client
  this._onEvent = onEvent
  this._query = q.wrap(expression)
  this._urlParams = options.fields ? { fields: options.fields.join(',') } : null
  this._fetch = platformCompatibleFetchOverride()
  this._abort = new AbortController()
  this._state = 'idle'

  // Determines a suitable override for the `cross-fetch` polyfill in the
  // current platform. If the `fetch` API is not supported, returns a function
  // that fails any requests so that errors are dispatched to appropriate error
  // handlers rather than introducing the need for a try/catch.
  function platformCompatibleFetchOverride() {
    var httpClient = client._http
    var fetch = httpClient._fetch

    if (util.isNodeEnv() || fetch.override || !fetch.polyfill) {
      return null // no override needed
    }

    fetch = http.resolveFetch(null, false)
    if (fetch === null) {
      fetch = function() {
        return Promise.reject(
          new errors.StreamsNotSupported(
            'Could not find a stream-compatible fetch function. ' +
              'Please, consider providing a Fetch API-compatible function ' +
              'with streamable response bodies.'
          )
        )
      }
    }

    return fetch
  }
}

/**
 * Takes a snapshot of the current query. Assumes the subscribed query returns a
 * reference.
 */
StreamClient.prototype.snapshot = function() {
  var self = this
  self._client
    .query(q.Get(self._query))
    .then(function(doc) {
      self._onEvent({
        type: 'snapshot',
        event: doc,
      })
    })
    .catch(function(error) {
      self._onEvent({
        type: 'error',
        event: error,
      })
    })
}

/** Initiates the stream subscription.  */
StreamClient.prototype.subscribe = function() {
  var self = this
  if (self._state === 'idle') {
    self._state = 'open'
  } else {
    throw new Error('The stream has already been started.')
  }

  var body = JSON.stringify(self._query)
  var startTime = Date.now()

  function handleResponse(response) {
    var endTime = Date.now()
    var parsed

    if (response.ok) {
      // There's no textual representation to be set here since streams are an
      // unbounded event source, hence, the syntactic representation.
      parsed = Promise.resolve({
        text: '[stream]',
        data: '[stream]',
      })
    } else {
      parsed = response.text().then(function(text) {
        return {
          text: text,
          data: json.parseJSON(text),
        }
      })
    }

    return parsed.then(function(parsed) {
      var headers = http.responseHeadersAsObject(response)
      var result = new RequestResult(
        'POST',
        'stream',
        self._urlParams,
        body,
        self._query,
        parsed.text,
        parsed.data,
        response.status,
        headers,
        startTime,
        endTime
      )
      self._client._handleRequestResult(response, result)
    })
  }

  function onData(data) {
    var events = json.parseJSONStreaming(data)

    events.forEach(function(event) {
      if (event.txn !== undefined) {
        self._client.syncLastTxnTime(event.txn)
      }

      if (event.event === 'error') {
        onError(new errors.StreamErrorEvent(event))
      } else {
        self._onEvent(event)
      }
    })
  }

  function onError(error) {
    // AbortError is triggered by the AbortController as result of calling
    // close() on a Subscription. There's no need to relay this event back up.
    if (error.name !== 'AbortError') {
      self._onEvent({
        type: 'error',
        event: error,
      })
    }
  }

  // Minimum browser compatibility based on current code:
  //   Chrome                52
  //   Edge                  79
  //   Firefox               65
  //   IE                    NA
  //   Opera                 39
  //   Safari                10.1
  //   Android Webview       52
  //   Chrome for Android    52
  //   Firefox for Android   65
  //   Opera for Android     41
  //   Safari on iOS         10.3
  //   Samsung Internet      6.0
  function platformSpecificEventRead(response) {
    try {
      if (util.isNodeEnv()) {
        response.body.on('data', onData).on('error', onError)
      } else {
        // ATENTION: The following code is meant to run in browsers and is not
        // covered by current test automation. Manual testing on major browsers
        // is required after making changes to it.
        var reader = response.body.getReader()
        var decoder = new TextDecoder('utf-8')
        function pump() {
          return reader
            .read()
            .then(function process(msg) {
              if (!msg.done) {
                onData(decoder.decode(msg.value, { stream: true }))
                return pump()
              }
            })
            .catch(onError)
        }
        pump()
      }
    } catch (err) {
      throw new errors.StreamsNotSupported(
        'Unexpected error during stream initialization: ' + err
      )
    }
  }

  self._client._http
    .execute('POST', 'stream', body, self._urlParams, {
      fetch: self._fetch,
      signal: self._abort.signal,
    })
    .then(function(response) {
      return handleResponse(response).then(function() {
        platformSpecificEventRead(response, onData, onError)
      })
    })
    .catch(onError)
}

/** Closes the stream subscription by aborting its underlying http request. */
StreamClient.prototype.close = function() {
  if (this._state !== 'closed') {
    this._state = 'closed'
    this._abort.abort()
  }
}

/**
 * Event dispatch interface for stream subscription.
 *
 * @constructor
 * @param {string[]} allowedEvents List of allowed events.
 * @private
 */
function EventDispatcher(allowedEvents) {
  this._allowedEvents = allowedEvents
  this._listeners = {}
}

/** Subscribe to an event
 *
 * @param {string} type The event type.
 * @param {module:stream~Subscription~eventCalllback} callback
 *   The event's callback.
 */
EventDispatcher.prototype.on = function(type, callback) {
  if (this._allowedEvents.indexOf(type) === -1) {
    throw new Error('Unknown event type: ' + type)
  }
  if (this._listeners[type] === undefined) {
    this._listeners[type] = []
  }
  this._listeners[type].push(callback)
}

/**
 * Dispatch the given event to the appropriate listeners.
 *
 * @param {Object} event The event.
 */
EventDispatcher.prototype.dispatch = function(event) {
  var listeners = this._listeners[event.type]
  if (!listeners) {
    return
  }

  for (var i = 0; i < listeners.length; i++) {
    listeners[i].call(null, event.event, event)
  }
}

/**
 * Stream's start event. A stream subscription always begins with a start event.
 * Upcoming events are guaranteed to have transaction timestamps equal to or greater than
 * the stream's start timestamp.
 *
 * @event module:stream~Subscription#start
 * @type {object}
 * @property {string} type='start'
 *   The event type.
 * @property {number} txn
 *   The event's transaction timestamp.
 * @property {module:number} event
 *   The stream start timestamp.
 */

/**
 * A version event occurs upon any modifications to the current state of the
 * subscribed document.
 *
 * @event module:stream~Subscription#version
 * @type {object}
 * @property {string} type='version'
 *   The event type.
 * @property {number} txn
 *   The event's transaction timestamp.
 * @property {object} event
 *   The event's data.
 */

/**
 * A history rewrite event occurs upon any modifications to the history of the
 * subscribed document.
 *
 * @event module:stream~Subscription#history_rewrite
 * @type {object}
 * @property {string} type='history_rewrite'
 *   The event type.
 * @property {number} txn
 *   The event's transaction timestamp.
 * @property {object} event
 *   The event's data.
 */

/**
 * A snapshot event. A snapshot event is fired once the `document` stream helper
 * finishes loading the subscribed document's snapshot data. See {@link
 * Client#stream} for more details on the `document` stream helper.
 *
 * @event module:stream~Subscription#snapshot
 * @type {object}
 * @property {string} type='snapshot'
 *   The event type.
 * @property {number} txn
 *   The event's transaction timestamp.
 * @property {object} event
 *   The event's data.
 */

/**
 * An error event is fired both for client and server errors that may occur as
 * a result of a subscription.
 *
 * @event module:stream~Subscription#error
 * @type {object}
 * @property {string} type='error'
 *   The event type.
 * @property {?number} txn
 *   The event's transaction timestamp.
 * @property {Error} event
 *   The underlying error.
 */

/**
 * @typedef {Object} Options
 * @property {string[]} [fields=['action', 'document', 'diff', 'prev']]
 *   The fields event fields to opt-in during stream subscription. Possible
 *   options:
 *   * 'action': The action type
 *   * 'document': The document's data
 *   * 'diff': The difference between 'document' and 'prev'
 *   * 'prev': The event's previous data
 */

/**
 * The callback to be executed when an new event occurs.
 *
 * @callback module:stream~Subscription~eventCalllback
 * @param {any} data The event's data field.
 * @param {object} event The event's entire object.
 */

/**
 * A stream subscription which dispatches events received to the registered
 * listener functions. This class must be constructed via {@link Client#stream}
 * method.
 *
 * @constructor
 * @param {StreamClient} client
 *   Internal stream client interface.
 * @param {EventDispatcher} dispatcher
 *   Internal event dispatcher interface.
 */
function Subscription(client, dispatcher) {
  this._client = client
  this._dispatcher = dispatcher
}

/**
 * Subscribes to an event type.
 *
 * @param {string} event
 *   The event's type.
 * @param {module:stream~Subscription~eventCalllback} callback
 *   A callback function.
 *
 * @returns {module:stream~Subscription} This instance.
 */
Subscription.prototype.on = function(type, callback) {
  this._dispatcher.on(type, callback)
  return this
}

/**
 * Initiates the underlying subscription network calls.
 * @returns {module:stream~Subscription} This instance.
 */
Subscription.prototype.start = function() {
  this._client.subscribe()
  return this
}

/**
 * Stops the current subscription and closes the underlying network connection.
 */
Subscription.prototype.close = function() {
  this._client.close()
}

/**
 * Stream API factory function. See {@link Client#stream} for details on how to
 * use stream's public interface.
 * @private
 */
function StreamAPI(client) {
  var api = function(expression, options) {
    var dispatcher = new EventDispatcher(DefaultEvents)
    var streamClient = new StreamClient(client, expression, options, function(
      event
    ) {
      dispatcher.dispatch(event)
    })
    return new Subscription(streamClient, dispatcher)
  }

  api.document = function(expression, options) {
    var buffer = []
    var buffering = true
    var dispatcher = new EventDispatcher(DocumentStreamEvents)
    var streamClient = new StreamClient(client, expression, options, onEvent)

    function onEvent(event) {
      switch (event.type) {
        case 'start':
          dispatcher.dispatch(event)
          streamClient.snapshot()
          break
        case 'snapshot':
          resume(event)
          break
        case 'error':
          dispatcher.dispatch(event)
          break
        default:
          if (buffering) {
            buffer.push(event)
          } else {
            dispatcher.dispatch(event)
          }
      }
    }

    function resume(snapshotEvent) {
      dispatcher.dispatch(snapshotEvent)
      for (var i = 0; i < buffer.length; i++) {
        var bufferedEvent = buffer[i]
        if (bufferedEvent.txn > snapshotEvent.event.ts) {
          dispatcher.dispatch(bufferedEvent)
        }
      }
      buffering = false
      buffer = null
    }

    return new Subscription(streamClient, dispatcher)
  }

  return api
}

module.exports = {
  StreamAPI: StreamAPI,
}
