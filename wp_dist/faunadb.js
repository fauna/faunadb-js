/*! For license information please see faunadb.js.LICENSE.txt */
!(function(e, t) {
  'object' == typeof exports && 'object' == typeof module
    ? (module.exports = t())
    : 'function' == typeof define && define.amd
    ? define([], t)
    : 'object' == typeof exports
    ? (exports.faunadb = t())
    : (e.faunadb = t())
})(this, function() {
  return (() => {
    var e = {
        10: (e, t, n) => {
          var r = n(447),
            o = n(625)
          e.exports = o.mergeObjects(
            {
              Client: n(318),
              Expr: n(391),
              PageHelper: n(892),
              RequestResult: n(501),
              clientLogger: n(223),
              errors: n(658),
              values: n(183),
              query: r,
            },
            r
          )
        },
        271: (e, t, n) => {
          'use strict'
          Object.defineProperty(t, '__esModule', { value: !0 })
          var r = n(185)
          class o extends r.EventTarget {
            constructor() {
              throw (super(),
              new TypeError('AbortSignal cannot be constructed directly'))
            }
            get aborted() {
              const e = i.get(this)
              if ('boolean' != typeof e)
                throw new TypeError(
                  "Expected 'this' to be an 'AbortSignal' object, but got " +
                    (null === this ? 'null' : typeof this)
                )
              return e
            }
          }
          r.defineEventAttribute(o.prototype, 'abort')
          const i = new WeakMap()
          Object.defineProperties(o.prototype, { aborted: { enumerable: !0 } }),
            'function' == typeof Symbol &&
              'symbol' == typeof Symbol.toStringTag &&
              Object.defineProperty(o.prototype, Symbol.toStringTag, {
                configurable: !0,
                value: 'AbortSignal',
              })
          class a {
            constructor() {
              s.set(
                this,
                (function() {
                  const e = Object.create(o.prototype)
                  return r.EventTarget.call(e), i.set(e, !1), e
                })()
              )
            }
            get signal() {
              return u(this)
            }
            abort() {
              var e
              ;(e = u(this)),
                !1 === i.get(e) &&
                  (i.set(e, !0), e.dispatchEvent({ type: 'abort' }))
            }
          }
          const s = new WeakMap()
          function u(e) {
            const t = s.get(e)
            if (null == t)
              throw new TypeError(
                "Expected 'this' to be an 'AbortController' object, but got " +
                  (null === e ? 'null' : typeof e)
              )
            return t
          }
          Object.defineProperties(a.prototype, {
            signal: { enumerable: !0 },
            abort: { enumerable: !0 },
          }),
            'function' == typeof Symbol &&
              'symbol' == typeof Symbol.toStringTag &&
              Object.defineProperty(a.prototype, Symbol.toStringTag, {
                configurable: !0,
                value: 'AbortController',
              }),
            (t.AbortController = a),
            (t.AbortSignal = o),
            (t.default = a),
            (e.exports = a),
            (e.exports.AbortController = e.exports.default = a),
            (e.exports.AbortSignal = o)
        },
        550: (e, t, n) => {
          'use strict'
          const r = n(271),
            o =
              'undefined' != typeof self
                ? self
                : 'undefined' != typeof window
                ? window
                : void 0 !== n.g
                ? n.g
                : void 0
          o &&
            (void 0 === o.AbortController &&
              (o.AbortController = r.AbortController),
            void 0 === o.AbortSignal && (o.AbortSignal = r.AbortSignal))
        },
        742: (e, t) => {
          'use strict'
          ;(t.byteLength = function(e) {
            var t = u(e),
              n = t[0],
              r = t[1]
            return (3 * (n + r)) / 4 - r
          }),
            (t.toByteArray = function(e) {
              var t,
                n,
                i = u(e),
                a = i[0],
                s = i[1],
                c = new o(
                  (function(e, t, n) {
                    return (3 * (t + n)) / 4 - n
                  })(0, a, s)
                ),
                l = 0,
                f = s > 0 ? a - 4 : a
              for (n = 0; n < f; n += 4)
                (t =
                  (r[e.charCodeAt(n)] << 18) |
                  (r[e.charCodeAt(n + 1)] << 12) |
                  (r[e.charCodeAt(n + 2)] << 6) |
                  r[e.charCodeAt(n + 3)]),
                  (c[l++] = (t >> 16) & 255),
                  (c[l++] = (t >> 8) & 255),
                  (c[l++] = 255 & t)
              return (
                2 === s &&
                  ((t =
                    (r[e.charCodeAt(n)] << 2) | (r[e.charCodeAt(n + 1)] >> 4)),
                  (c[l++] = 255 & t)),
                1 === s &&
                  ((t =
                    (r[e.charCodeAt(n)] << 10) |
                    (r[e.charCodeAt(n + 1)] << 4) |
                    (r[e.charCodeAt(n + 2)] >> 2)),
                  (c[l++] = (t >> 8) & 255),
                  (c[l++] = 255 & t)),
                c
              )
            }),
            (t.fromByteArray = function(e) {
              for (
                var t,
                  r = e.length,
                  o = r % 3,
                  i = [],
                  a = 16383,
                  s = 0,
                  u = r - o;
                s < u;
                s += a
              )
                i.push(c(e, s, s + a > u ? u : s + a))
              return (
                1 === o
                  ? ((t = e[r - 1]),
                    i.push(n[t >> 2] + n[(t << 4) & 63] + '=='))
                  : 2 === o &&
                    ((t = (e[r - 2] << 8) + e[r - 1]),
                    i.push(
                      n[t >> 10] + n[(t >> 4) & 63] + n[(t << 2) & 63] + '='
                    )),
                i.join('')
              )
            })
          for (
            var n = [],
              r = [],
              o = 'undefined' != typeof Uint8Array ? Uint8Array : Array,
              i =
                'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
              a = 0,
              s = i.length;
            a < s;
            ++a
          )
            (n[a] = i[a]), (r[i.charCodeAt(a)] = a)
          function u(e) {
            var t = e.length
            if (t % 4 > 0)
              throw new Error('Invalid string. Length must be a multiple of 4')
            var n = e.indexOf('=')
            return -1 === n && (n = t), [n, n === t ? 0 : 4 - (n % 4)]
          }
          function c(e, t, r) {
            for (var o, i, a = [], s = t; s < r; s += 3)
              (o =
                ((e[s] << 16) & 16711680) +
                ((e[s + 1] << 8) & 65280) +
                (255 & e[s + 2])),
                a.push(
                  n[((i = o) >> 18) & 63] +
                    n[(i >> 12) & 63] +
                    n[(i >> 6) & 63] +
                    n[63 & i]
                )
            return a.join('')
          }
          ;(r['-'.charCodeAt(0)] = 62), (r['_'.charCodeAt(0)] = 63)
        },
        98: function(e, t) {
          var n = (function(e) {
            function t() {
              ;(this.fetch = !1), (this.DOMException = e.DOMException)
            }
            return (t.prototype = e), new t()
          })('undefined' != typeof self ? self : this)
          !(function(e) {
            !(function(t) {
              var n = 'URLSearchParams' in e,
                r = 'Symbol' in e && 'iterator' in Symbol,
                o =
                  'FileReader' in e &&
                  'Blob' in e &&
                  (function() {
                    try {
                      return new Blob(), !0
                    } catch (e) {
                      return !1
                    }
                  })(),
                i = 'FormData' in e,
                a = 'ArrayBuffer' in e
              if (a)
                var s = [
                    '[object Int8Array]',
                    '[object Uint8Array]',
                    '[object Uint8ClampedArray]',
                    '[object Int16Array]',
                    '[object Uint16Array]',
                    '[object Int32Array]',
                    '[object Uint32Array]',
                    '[object Float32Array]',
                    '[object Float64Array]',
                  ],
                  u =
                    ArrayBuffer.isView ||
                    function(e) {
                      return (
                        e && s.indexOf(Object.prototype.toString.call(e)) > -1
                      )
                    }
              function c(e) {
                if (
                  ('string' != typeof e && (e = String(e)),
                  /[^a-z0-9\-#$%&'*+.^_`|~]/i.test(e))
                )
                  throw new TypeError('Invalid character in header field name')
                return e.toLowerCase()
              }
              function l(e) {
                return 'string' != typeof e && (e = String(e)), e
              }
              function f(e) {
                var t = {
                  next: function() {
                    var t = e.shift()
                    return { done: void 0 === t, value: t }
                  },
                }
                return (
                  r &&
                    (t[Symbol.iterator] = function() {
                      return t
                    }),
                  t
                )
              }
              function p(e) {
                ;(this.map = {}),
                  e instanceof p
                    ? e.forEach(function(e, t) {
                        this.append(t, e)
                      }, this)
                    : Array.isArray(e)
                    ? e.forEach(function(e) {
                        this.append(e[0], e[1])
                      }, this)
                    : e &&
                      Object.getOwnPropertyNames(e).forEach(function(t) {
                        this.append(t, e[t])
                      }, this)
              }
              function h(e) {
                if (e.bodyUsed)
                  return Promise.reject(new TypeError('Already read'))
                e.bodyUsed = !0
              }
              function d(e) {
                return new Promise(function(t, n) {
                  ;(e.onload = function() {
                    t(e.result)
                  }),
                    (e.onerror = function() {
                      n(e.error)
                    })
                })
              }
              function m(e) {
                var t = new FileReader(),
                  n = d(t)
                return t.readAsArrayBuffer(e), n
              }
              function y(e) {
                if (e.slice) return e.slice(0)
                var t = new Uint8Array(e.byteLength)
                return t.set(new Uint8Array(e)), t.buffer
              }
              function w() {
                return (
                  (this.bodyUsed = !1),
                  (this._initBody = function(e) {
                    var t
                    ;(this._bodyInit = e),
                      e
                        ? 'string' == typeof e
                          ? (this._bodyText = e)
                          : o && Blob.prototype.isPrototypeOf(e)
                          ? (this._bodyBlob = e)
                          : i && FormData.prototype.isPrototypeOf(e)
                          ? (this._bodyFormData = e)
                          : n && URLSearchParams.prototype.isPrototypeOf(e)
                          ? (this._bodyText = e.toString())
                          : a &&
                            o &&
                            (t = e) &&
                            DataView.prototype.isPrototypeOf(t)
                          ? ((this._bodyArrayBuffer = y(e.buffer)),
                            (this._bodyInit = new Blob([
                              this._bodyArrayBuffer,
                            ])))
                          : a &&
                            (ArrayBuffer.prototype.isPrototypeOf(e) || u(e))
                          ? (this._bodyArrayBuffer = y(e))
                          : (this._bodyText = e = Object.prototype.toString.call(
                              e
                            ))
                        : (this._bodyText = ''),
                      this.headers.get('content-type') ||
                        ('string' == typeof e
                          ? this.headers.set(
                              'content-type',
                              'text/plain;charset=UTF-8'
                            )
                          : this._bodyBlob && this._bodyBlob.type
                          ? this.headers.set(
                              'content-type',
                              this._bodyBlob.type
                            )
                          : n &&
                            URLSearchParams.prototype.isPrototypeOf(e) &&
                            this.headers.set(
                              'content-type',
                              'application/x-www-form-urlencoded;charset=UTF-8'
                            ))
                  }),
                  o &&
                    ((this.blob = function() {
                      var e = h(this)
                      if (e) return e
                      if (this._bodyBlob) return Promise.resolve(this._bodyBlob)
                      if (this._bodyArrayBuffer)
                        return Promise.resolve(
                          new Blob([this._bodyArrayBuffer])
                        )
                      if (this._bodyFormData)
                        throw new Error('could not read FormData body as blob')
                      return Promise.resolve(new Blob([this._bodyText]))
                    }),
                    (this.arrayBuffer = function() {
                      return this._bodyArrayBuffer
                        ? h(this) || Promise.resolve(this._bodyArrayBuffer)
                        : this.blob().then(m)
                    })),
                  (this.text = function() {
                    var e,
                      t,
                      n,
                      r = h(this)
                    if (r) return r
                    if (this._bodyBlob)
                      return (
                        (e = this._bodyBlob),
                        (n = d((t = new FileReader()))),
                        t.readAsText(e),
                        n
                      )
                    if (this._bodyArrayBuffer)
                      return Promise.resolve(
                        (function(e) {
                          for (
                            var t = new Uint8Array(e),
                              n = new Array(t.length),
                              r = 0;
                            r < t.length;
                            r++
                          )
                            n[r] = String.fromCharCode(t[r])
                          return n.join('')
                        })(this._bodyArrayBuffer)
                      )
                    if (this._bodyFormData)
                      throw new Error('could not read FormData body as text')
                    return Promise.resolve(this._bodyText)
                  }),
                  i &&
                    (this.formData = function() {
                      return this.text().then(g)
                    }),
                  (this.json = function() {
                    return this.text().then(JSON.parse)
                  }),
                  this
                )
              }
              ;(p.prototype.append = function(e, t) {
                ;(e = c(e)), (t = l(t))
                var n = this.map[e]
                this.map[e] = n ? n + ', ' + t : t
              }),
                (p.prototype.delete = function(e) {
                  delete this.map[c(e)]
                }),
                (p.prototype.get = function(e) {
                  return (e = c(e)), this.has(e) ? this.map[e] : null
                }),
                (p.prototype.has = function(e) {
                  return this.map.hasOwnProperty(c(e))
                }),
                (p.prototype.set = function(e, t) {
                  this.map[c(e)] = l(t)
                }),
                (p.prototype.forEach = function(e, t) {
                  for (var n in this.map)
                    this.map.hasOwnProperty(n) &&
                      e.call(t, this.map[n], n, this)
                }),
                (p.prototype.keys = function() {
                  var e = []
                  return (
                    this.forEach(function(t, n) {
                      e.push(n)
                    }),
                    f(e)
                  )
                }),
                (p.prototype.values = function() {
                  var e = []
                  return (
                    this.forEach(function(t) {
                      e.push(t)
                    }),
                    f(e)
                  )
                }),
                (p.prototype.entries = function() {
                  var e = []
                  return (
                    this.forEach(function(t, n) {
                      e.push([n, t])
                    }),
                    f(e)
                  )
                }),
                r && (p.prototype[Symbol.iterator] = p.prototype.entries)
              var b = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']
              function v(e, t) {
                var n,
                  r,
                  o = (t = t || {}).body
                if (e instanceof v) {
                  if (e.bodyUsed) throw new TypeError('Already read')
                  ;(this.url = e.url),
                    (this.credentials = e.credentials),
                    t.headers || (this.headers = new p(e.headers)),
                    (this.method = e.method),
                    (this.mode = e.mode),
                    (this.signal = e.signal),
                    o ||
                      null == e._bodyInit ||
                      ((o = e._bodyInit), (e.bodyUsed = !0))
                } else this.url = String(e)
                if (
                  ((this.credentials =
                    t.credentials || this.credentials || 'same-origin'),
                  (!t.headers && this.headers) ||
                    (this.headers = new p(t.headers)),
                  (this.method =
                    ((r = (n = t.method || this.method || 'GET').toUpperCase()),
                    b.indexOf(r) > -1 ? r : n)),
                  (this.mode = t.mode || this.mode || null),
                  (this.signal = t.signal || this.signal),
                  (this.referrer = null),
                  ('GET' === this.method || 'HEAD' === this.method) && o)
                )
                  throw new TypeError(
                    'Body not allowed for GET or HEAD requests'
                  )
                this._initBody(o)
              }
              function g(e) {
                var t = new FormData()
                return (
                  e
                    .trim()
                    .split('&')
                    .forEach(function(e) {
                      if (e) {
                        var n = e.split('='),
                          r = n.shift().replace(/\+/g, ' '),
                          o = n.join('=').replace(/\+/g, ' ')
                        t.append(decodeURIComponent(r), decodeURIComponent(o))
                      }
                    }),
                  t
                )
              }
              function x(e, t) {
                t || (t = {}),
                  (this.type = 'default'),
                  (this.status = void 0 === t.status ? 200 : t.status),
                  (this.ok = this.status >= 200 && this.status < 300),
                  (this.statusText = 'statusText' in t ? t.statusText : 'OK'),
                  (this.headers = new p(t.headers)),
                  (this.url = t.url || ''),
                  this._initBody(e)
              }
              ;(v.prototype.clone = function() {
                return new v(this, { body: this._bodyInit })
              }),
                w.call(v.prototype),
                w.call(x.prototype),
                (x.prototype.clone = function() {
                  return new x(this._bodyInit, {
                    status: this.status,
                    statusText: this.statusText,
                    headers: new p(this.headers),
                    url: this.url,
                  })
                }),
                (x.error = function() {
                  var e = new x(null, { status: 0, statusText: '' })
                  return (e.type = 'error'), e
                })
              var _ = [301, 302, 303, 307, 308]
              ;(x.redirect = function(e, t) {
                if (-1 === _.indexOf(t))
                  throw new RangeError('Invalid status code')
                return new x(null, { status: t, headers: { location: e } })
              }),
                (t.DOMException = e.DOMException)
              try {
                new t.DOMException()
              } catch (e) {
                ;(t.DOMException = function(e, t) {
                  ;(this.message = e), (this.name = t)
                  var n = Error(e)
                  this.stack = n.stack
                }),
                  (t.DOMException.prototype = Object.create(Error.prototype)),
                  (t.DOMException.prototype.constructor = t.DOMException)
              }
              function E(e, n) {
                return new Promise(function(r, i) {
                  var a = new v(e, n)
                  if (a.signal && a.signal.aborted)
                    return i(new t.DOMException('Aborted', 'AbortError'))
                  var s = new XMLHttpRequest()
                  function u() {
                    s.abort()
                  }
                  ;(s.onload = function() {
                    var e,
                      t,
                      n = {
                        status: s.status,
                        statusText: s.statusText,
                        headers:
                          ((e = s.getAllResponseHeaders() || ''),
                          (t = new p()),
                          e
                            .replace(/\r?\n[\t ]+/g, ' ')
                            .split(/\r?\n/)
                            .forEach(function(e) {
                              var n = e.split(':'),
                                r = n.shift().trim()
                              if (r) {
                                var o = n.join(':').trim()
                                t.append(r, o)
                              }
                            }),
                          t),
                      }
                    n.url =
                      'responseURL' in s
                        ? s.responseURL
                        : n.headers.get('X-Request-URL')
                    var o = 'response' in s ? s.response : s.responseText
                    r(new x(o, n))
                  }),
                    (s.onerror = function() {
                      i(new TypeError('Network request failed'))
                    }),
                    (s.ontimeout = function() {
                      i(new TypeError('Network request failed'))
                    }),
                    (s.onabort = function() {
                      i(new t.DOMException('Aborted', 'AbortError'))
                    }),
                    s.open(a.method, a.url, !0),
                    'include' === a.credentials
                      ? (s.withCredentials = !0)
                      : 'omit' === a.credentials && (s.withCredentials = !1),
                    'responseType' in s && o && (s.responseType = 'blob'),
                    a.headers.forEach(function(e, t) {
                      s.setRequestHeader(t, e)
                    }),
                    a.signal &&
                      (a.signal.addEventListener('abort', u),
                      (s.onreadystatechange = function() {
                        4 === s.readyState &&
                          a.signal.removeEventListener('abort', u)
                      })),
                    s.send(void 0 === a._bodyInit ? null : a._bodyInit)
                })
              }
              ;(E.polyfill = !0),
                e.fetch ||
                  ((e.fetch = E),
                  (e.Headers = p),
                  (e.Request = v),
                  (e.Response = x)),
                (t.Headers = p),
                (t.Request = v),
                (t.Response = x),
                (t.fetch = E)
            })({})
          })(n),
            delete n.fetch.polyfill,
            ((t = n.fetch).default = n.fetch),
            (t.fetch = n.fetch),
            (t.Headers = n.Headers),
            (t.Request = n.Request),
            (t.Response = n.Response),
            (e.exports = t)
        },
        185: (e, t) => {
          'use strict'
          Object.defineProperty(t, '__esModule', { value: !0 })
          const n = new WeakMap(),
            r = new WeakMap()
          function o(e) {
            const t = n.get(e)
            return (
              console.assert(
                null != t,
                "'this' is expected an Event object, but got",
                e
              ),
              t
            )
          }
          function i(e) {
            null == e.passiveListener
              ? e.event.cancelable &&
                ((e.canceled = !0),
                'function' == typeof e.event.preventDefault &&
                  e.event.preventDefault())
              : 'undefined' != typeof console &&
                'function' == typeof console.error &&
                console.error(
                  'Unable to preventDefault inside passive event listener invocation.',
                  e.passiveListener
                )
          }
          function a(e, t) {
            n.set(this, {
              eventTarget: e,
              event: t,
              eventPhase: 2,
              currentTarget: e,
              canceled: !1,
              stopped: !1,
              immediateStopped: !1,
              passiveListener: null,
              timeStamp: t.timeStamp || Date.now(),
            }),
              Object.defineProperty(this, 'isTrusted', {
                value: !1,
                enumerable: !0,
              })
            const r = Object.keys(t)
            for (let e = 0; e < r.length; ++e) {
              const t = r[e]
              t in this || Object.defineProperty(this, t, s(t))
            }
          }
          function s(e) {
            return {
              get() {
                return o(this).event[e]
              },
              set(t) {
                o(this).event[e] = t
              },
              configurable: !0,
              enumerable: !0,
            }
          }
          function u(e) {
            return {
              value() {
                const t = o(this).event
                return t[e].apply(t, arguments)
              },
              configurable: !0,
              enumerable: !0,
            }
          }
          function c(e) {
            if (null == e || e === Object.prototype) return a
            let t = r.get(e)
            return (
              null == t &&
                ((t = (function(e, t) {
                  const n = Object.keys(t)
                  if (0 === n.length) return e
                  function r(t, n) {
                    e.call(this, t, n)
                  }
                  r.prototype = Object.create(e.prototype, {
                    constructor: { value: r, configurable: !0, writable: !0 },
                  })
                  for (let o = 0; o < n.length; ++o) {
                    const i = n[o]
                    if (!(i in e.prototype)) {
                      const e =
                        'function' ==
                        typeof Object.getOwnPropertyDescriptor(t, i).value
                      Object.defineProperty(r.prototype, i, e ? u(i) : s(i))
                    }
                  }
                  return r
                })(c(Object.getPrototypeOf(e)), e)),
                r.set(e, t)),
              t
            )
          }
          function l(e) {
            return o(e).immediateStopped
          }
          function f(e, t) {
            o(e).passiveListener = t
          }
          ;(a.prototype = {
            get type() {
              return o(this).event.type
            },
            get target() {
              return o(this).eventTarget
            },
            get currentTarget() {
              return o(this).currentTarget
            },
            composedPath() {
              const e = o(this).currentTarget
              return null == e ? [] : [e]
            },
            get NONE() {
              return 0
            },
            get CAPTURING_PHASE() {
              return 1
            },
            get AT_TARGET() {
              return 2
            },
            get BUBBLING_PHASE() {
              return 3
            },
            get eventPhase() {
              return o(this).eventPhase
            },
            stopPropagation() {
              const e = o(this)
              ;(e.stopped = !0),
                'function' == typeof e.event.stopPropagation &&
                  e.event.stopPropagation()
            },
            stopImmediatePropagation() {
              const e = o(this)
              ;(e.stopped = !0),
                (e.immediateStopped = !0),
                'function' == typeof e.event.stopImmediatePropagation &&
                  e.event.stopImmediatePropagation()
            },
            get bubbles() {
              return Boolean(o(this).event.bubbles)
            },
            get cancelable() {
              return Boolean(o(this).event.cancelable)
            },
            preventDefault() {
              i(o(this))
            },
            get defaultPrevented() {
              return o(this).canceled
            },
            get composed() {
              return Boolean(o(this).event.composed)
            },
            get timeStamp() {
              return o(this).timeStamp
            },
            get srcElement() {
              return o(this).eventTarget
            },
            get cancelBubble() {
              return o(this).stopped
            },
            set cancelBubble(e) {
              if (!e) return
              const t = o(this)
              ;(t.stopped = !0),
                'boolean' == typeof t.event.cancelBubble &&
                  (t.event.cancelBubble = !0)
            },
            get returnValue() {
              return !o(this).canceled
            },
            set returnValue(e) {
              e || i(o(this))
            },
            initEvent() {},
          }),
            Object.defineProperty(a.prototype, 'constructor', {
              value: a,
              configurable: !0,
              writable: !0,
            }),
            'undefined' != typeof window &&
              void 0 !== window.Event &&
              (Object.setPrototypeOf(a.prototype, window.Event.prototype),
              r.set(window.Event.prototype, a))
          const p = new WeakMap()
          function h(e) {
            return null !== e && 'object' == typeof e
          }
          function d(e) {
            const t = p.get(e)
            if (null == t)
              throw new TypeError(
                "'this' is expected an EventTarget object, but got another value."
              )
            return t
          }
          function m(e, t) {
            Object.defineProperty(
              e,
              `on${t}`,
              (function(e) {
                return {
                  get() {
                    let t = d(this).get(e)
                    for (; null != t; ) {
                      if (3 === t.listenerType) return t.listener
                      t = t.next
                    }
                    return null
                  },
                  set(t) {
                    'function' == typeof t || h(t) || (t = null)
                    const n = d(this)
                    let r = null,
                      o = n.get(e)
                    for (; null != o; )
                      3 === o.listenerType
                        ? null !== r
                          ? (r.next = o.next)
                          : null !== o.next
                          ? n.set(e, o.next)
                          : n.delete(e)
                        : (r = o),
                        (o = o.next)
                    if (null !== t) {
                      const o = {
                        listener: t,
                        listenerType: 3,
                        passive: !1,
                        once: !1,
                        next: null,
                      }
                      null === r ? n.set(e, o) : (r.next = o)
                    }
                  },
                  configurable: !0,
                  enumerable: !0,
                }
              })(t)
            )
          }
          function y(e) {
            function t() {
              w.call(this)
            }
            t.prototype = Object.create(w.prototype, {
              constructor: { value: t, configurable: !0, writable: !0 },
            })
            for (let n = 0; n < e.length; ++n) m(t.prototype, e[n])
            return t
          }
          function w() {
            if (!(this instanceof w)) {
              if (1 === arguments.length && Array.isArray(arguments[0]))
                return y(arguments[0])
              if (arguments.length > 0) {
                const e = new Array(arguments.length)
                for (let t = 0; t < arguments.length; ++t) e[t] = arguments[t]
                return y(e)
              }
              throw new TypeError('Cannot call a class as a function')
            }
            p.set(this, new Map())
          }
          ;(w.prototype = {
            addEventListener(e, t, n) {
              if (null == t) return
              if ('function' != typeof t && !h(t))
                throw new TypeError(
                  "'listener' should be a function or an object."
                )
              const r = d(this),
                o = h(n),
                i = (o ? Boolean(n.capture) : Boolean(n)) ? 1 : 2,
                a = {
                  listener: t,
                  listenerType: i,
                  passive: o && Boolean(n.passive),
                  once: o && Boolean(n.once),
                  next: null,
                }
              let s = r.get(e)
              if (void 0 === s) return void r.set(e, a)
              let u = null
              for (; null != s; ) {
                if (s.listener === t && s.listenerType === i) return
                ;(u = s), (s = s.next)
              }
              u.next = a
            },
            removeEventListener(e, t, n) {
              if (null == t) return
              const r = d(this),
                o = (h(n) ? Boolean(n.capture) : Boolean(n)) ? 1 : 2
              let i = null,
                a = r.get(e)
              for (; null != a; ) {
                if (a.listener === t && a.listenerType === o)
                  return void (null !== i
                    ? (i.next = a.next)
                    : null !== a.next
                    ? r.set(e, a.next)
                    : r.delete(e))
                ;(i = a), (a = a.next)
              }
            },
            dispatchEvent(e) {
              if (null == e || 'string' != typeof e.type)
                throw new TypeError('"event.type" should be a string.')
              const t = d(this),
                n = e.type
              let r = t.get(n)
              if (null == r) return !0
              const i = (function(e, t) {
                return new (c(Object.getPrototypeOf(t)))(e, t)
              })(this, e)
              let a = null
              for (; null != r; ) {
                if (
                  (r.once
                    ? null !== a
                      ? (a.next = r.next)
                      : null !== r.next
                      ? t.set(n, r.next)
                      : t.delete(n)
                    : (a = r),
                  f(i, r.passive ? r.listener : null),
                  'function' == typeof r.listener)
                )
                  try {
                    r.listener.call(this, i)
                  } catch (e) {
                    'undefined' != typeof console &&
                      'function' == typeof console.error &&
                      console.error(e)
                  }
                else
                  3 !== r.listenerType &&
                    'function' == typeof r.listener.handleEvent &&
                    r.listener.handleEvent(i)
                if (l(i)) break
                r = r.next
              }
              return (
                f(i, null),
                (function(e, t) {
                  o(e).eventPhase = 0
                })(i),
                (function(e, t) {
                  o(e).currentTarget = null
                })(i),
                !i.defaultPrevented
              )
            },
          }),
            Object.defineProperty(w.prototype, 'constructor', {
              value: w,
              configurable: !0,
              writable: !0,
            }),
            'undefined' != typeof window &&
              void 0 !== window.EventTarget &&
              Object.setPrototypeOf(w.prototype, window.EventTarget.prototype),
            (t.defineEventAttribute = m),
            (t.EventTarget = w),
            (t.default = w),
            (e.exports = w),
            (e.exports.EventTarget = e.exports.default = w),
            (e.exports.defineEventAttribute = m)
        },
        228: e => {
          'use strict'
          e.exports = function(e) {
            if ('function' != typeof e)
              throw new Error(
                'Could not parse function signature for injection dependencies: Object is not a function'
              )
            if (!e.length) return []
            var t =
              /^()\(?([^)=]*)\)? *=>/.exec(e + '') ||
              /^[^(]+([^ \(]*) *\(([^\)]*)\)/.exec(e + '')
            if (!t)
              throw new Error(
                'Could not parse function signature for injection dependencies: ' +
                  e
              )
            var n = t[2]
              .replace(/\/\*[\S\s]*?\*\//g, ' ')
              .replace(/\/\/.*/g, ' ')
            function r(e, t, n) {
              return (
                t +
                n
                  .split(',')
                  .map(function(e) {
                    return e && e.trim()
                  })
                  .filter(Boolean)
                  .join('@')
              )
            }
            return (n = (n = n.replace(/(\{)([^}]*)\}/g, r)).replace(
              /(\[)([^}]*)\]/g,
              r
            ))
              .split(',')
              .map(function(e) {
                return e && e.trim()
              })
              .map(function(e) {
                return '{' === e[0]
                  ? e.substring(1).split('@')
                  : '[' === e[0]
                  ? { items: e.substring(1).split('@') }
                  : e
              })
              .filter(Boolean)
          }
        },
        418: e => {
          'use strict'
          var t = Object.getOwnPropertySymbols,
            n = Object.prototype.hasOwnProperty,
            r = Object.prototype.propertyIsEnumerable
          function o(e) {
            if (null == e)
              throw new TypeError(
                'Object.assign cannot be called with null or undefined'
              )
            return Object(e)
          }
          e.exports = (function() {
            try {
              if (!Object.assign) return !1
              var e = new String('abc')
              if (((e[5] = 'de'), '5' === Object.getOwnPropertyNames(e)[0]))
                return !1
              for (var t = {}, n = 0; n < 10; n++)
                t['_' + String.fromCharCode(n)] = n
              if (
                '0123456789' !==
                Object.getOwnPropertyNames(t)
                  .map(function(e) {
                    return t[e]
                  })
                  .join('')
              )
                return !1
              var r = {}
              return (
                'abcdefghijklmnopqrst'.split('').forEach(function(e) {
                  r[e] = e
                }),
                'abcdefghijklmnopqrst' ===
                  Object.keys(Object.assign({}, r)).join('')
              )
            } catch (e) {
              return !1
            }
          })()
            ? Object.assign
            : function(e, i) {
                for (var a, s, u = o(e), c = 1; c < arguments.length; c++) {
                  for (var l in (a = Object(arguments[c])))
                    n.call(a, l) && (u[l] = a[l])
                  if (t) {
                    s = t(a)
                    for (var f = 0; f < s.length; f++)
                      r.call(a, s[f]) && (u[s[f]] = a[s[f]])
                  }
                }
                return u
              }
        },
        927: (e, t, n) => {
          function r(e) {
            try {
              if (!n.g.localStorage) return !1
            } catch (e) {
              return !1
            }
            var t = n.g.localStorage[e]
            return null != t && 'true' === String(t).toLowerCase()
          }
          e.exports = function(e, t) {
            if (r('noDeprecation')) return e
            var n = !1
            return function() {
              if (!n) {
                if (r('throwDeprecation')) throw new Error(t)
                r('traceDeprecation') ? console.trace(t) : console.warn(t),
                  (n = !0)
              }
              return e.apply(this, arguments)
            }
          }
        },
        306: e => {
          'use strict'
          e.exports = JSON.parse(
            '{"name":"faunadb","version":"4.1.1","apiVersion":"4","description":"FaunaDB Javascript driver for Node.JS and Browsers","homepage":"https://fauna.com","repository":"fauna/faunadb-js","license":"MPL-2.0","keywords":["database","fauna","official","driver"],"bugs":{"url":"https://github.com/fauna/faunadb-js/issues"},"files":["index.d.ts","src/","dist/"],"main":"index.js","scripts":{"doc":"jsdoc -c ./jsdoc.json","browserify":"browserify index.js --standalone faunadb -o dist/faunadb.js","browserify-min":"browserify index.js --standalone faunadb | terser -c -m --keep-fnames --keep-classnames -o dist/faunadb-min.js","prettify":"prettier --write \\"{src,test}/**/*.{js,ts}\\"","test":"jest --env=node --verbose=false ./test","semantic-release":"semantic-release","wp":"webpack"},"types":"index.d.ts","dependencies":{"abort-controller":"^3.0.0","base64-js":"^1.2.0","browser-detect":"^0.2.28","btoa-lite":"^1.0.0","cross-fetch":"^3.0.6","dotenv":"^8.2.0","fn-annotate":"^1.1.3","object-assign":"^4.1.0","util-deprecate":"^1.0.2"},"devDependencies":{"browserify":"^16.2.2","eslint":"^5.3.0","eslint-config-prettier":"^6.5.0","eslint-plugin-prettier":"^3.1.1","husky":">=1","ink-docstrap":"^1.2.1","jest":"^24.9.0","jsdoc":"^3.6.3","lint-staged":">=8","prettier":"1.18.2","semantic-release":"^17.1.2","terser":"^4.3.9","webpack":"^5.23.0","webpack-cli":"^4.5.0"},"husky":{"hooks":{"pre-commit":"lint-staged"}},"lint-staged":{"*.{js,css,json,md}":["prettier --write","git add"],"*.js":["eslint --fix","git add"]},"release":{"branches":["master"]},"browser":{"http2":false,"http":false,"https":false,"os":false,"util":false}}'
          )
        },
        318: (e, t, n) => {
          'use strict'
          var r = n(892),
            o = n(501),
            i = n(658),
            a = n(656),
            s = n(152),
            u = n(447),
            c = n(229),
            l = n(625),
            f = n(183)
          function p(e) {
            ;(e = l.applyDefaults(e, {
              domain: 'db.fauna.com',
              scheme: 'https',
              port: null,
              secret: null,
              timeout: 60,
              observer: null,
              keepAlive: !0,
              headers: {},
              fetch: void 0,
              queryTimeout: null,
            })),
              (this._observer = e.observer),
              (this._http = new a.HttpClient(e)),
              (this.stream = c.StreamAPI(this))
          }
          ;(p.prototype.query = function(e, t) {
            return this._execute('POST', '', u.wrap(e), null, t)
          }),
            (p.prototype.paginate = function(e, t, n) {
              return (
                (t = l.defaults(t, {})),
                (n = l.defaults(n, {})),
                new r(this, e, t, n)
              )
            }),
            (p.prototype.ping = function(e, t) {
              return this._execute('GET', 'ping', null, {
                scope: e,
                timeout: t,
              })
            }),
            (p.prototype.getLastTxnTime = function() {
              return this._http.getLastTxnTime()
            }),
            (p.prototype.syncLastTxnTime = function(e) {
              this._http.syncLastTxnTime(e)
            }),
            (p.prototype._execute = function(e, t, n, r, i) {
              ;(r = l.defaults(r, null)),
                (t instanceof f.Ref ||
                  l.checkInstanceHasProperty(t, '_isFaunaRef')) &&
                  (t = t.value),
                null !== r && (r = l.removeUndefinedValues(r))
              var a = Date.now(),
                u = this,
                c = ['GET', 'HEAD'].indexOf(e) >= 0 ? void 0 : JSON.stringify(n)
              return this._http
                .execute(
                  Object.assign({}, i, {
                    path: t,
                    query: r,
                    method: e,
                    body: c,
                  })
                )
                .then(function(l) {
                  var f = Date.now(),
                    p = s.parseJSON(l.body),
                    h = new o(
                      e,
                      t,
                      r,
                      c,
                      n,
                      l.body,
                      p,
                      l.status,
                      l.headers,
                      a,
                      f
                    )
                  return u._handleRequestResult(l, h, i), p.resource
                })
            }),
            (p.prototype._handleRequestResult = function(e, t, n) {
              null != e.headers['x-txn-time'] &&
                this.syncLastTxnTime(parseInt(e.headers['x-txn-time'], 10)),
                [this._observer, n && n.observer].forEach(e => {
                  'function' == typeof e && e(t, this)
                }),
                i.FaunaHTTPError.raiseForStatusCode(t)
            }),
            (e.exports = p)
        },
        391: (e, t, n) => {
          'use strict'
          var r = n(625)
          function o(e) {
            this.raw = e
          }
          ;(o.prototype._isFaunaExpr = !0),
            (o.prototype.toJSON = function() {
              return this.raw
            }),
            (o.prototype.toFQL = function() {
              return l(this.raw)
            })
          var i = [
              'Do',
              'Call',
              'Union',
              'Intersection',
              'Difference',
              'Equals',
              'Add',
              'BitAnd',
              'BitOr',
              'BitXor',
              'Divide',
              'Max',
              'Min',
              'Modulo',
              'Multiply',
              'Subtract',
              'LT',
              'LTE',
              'GT',
              'GTE',
              'And',
              'Or',
            ],
            a = {
              containsstrregex: 'ContainsStrRegex',
              endswith: 'EndsWith',
              findstr: 'FindStr',
              findstrregex: 'FindStrRegex',
              gt: 'GT',
              gte: 'GTE',
              is_nonempty: 'is_non_empty',
              lowercase: 'LowerCase',
              lt: 'LT',
              lte: 'LTE',
              ltrim: 'LTrim',
              rtrim: 'RTrim',
              regexescape: 'RegexEscape',
              replacestr: 'ReplaceStr',
              replacestrregex: 'ReplaceStrRegex',
              startswith: 'StartsWith',
              substring: 'SubString',
              titlecase: 'TitleCase',
              uppercase: 'UpperCase',
            }
          function s(e) {
            return (
              e instanceof o || r.checkInstanceHasProperty(e, '_isFaunaExpr')
            )
          }
          function u(e) {
            return (
              '{' +
              Object.keys(e)
                .map(function(t) {
                  return t + ': ' + l(e[t])
                })
                .join(', ') +
              '}'
            )
          }
          function c(e, t) {
            return e
              .map(function(e) {
                return t(e)
              })
              .join(', ')
          }
          var l = function(e, t) {
            if (s(e)) {
              if ('value' in e) return e.toString()
              e = e.raw
            }
            if (null === e) return 'null'
            switch (typeof e) {
              case 'string':
                return JSON.stringify(e)
              case 'symbol':
              case 'number':
              case 'boolean':
                return e.toString()
              case 'undefined':
                return 'undefined'
            }
            if (Array.isArray(e)) {
              var n = c(e, l)
              return -1 != i.indexOf(t) ? n : '[' + n + ']'
            }
            if ('match' in e) {
              var r = l(e.match),
                o = e.terms || []
              return (
                s(o) && (o = o.raw),
                Array.isArray(o) && 0 == o.length
                  ? 'Match(' + r + ')'
                  : Array.isArray(o)
                  ? 'Match(' + r + ', [' + c(o, l) + '])'
                  : 'Match(' + r + ', ' + l(o) + ')'
              )
            }
            if ('paginate' in e) {
              if (1 === Object.keys(e).length)
                return 'Paginate(' + l(e.paginate) + ')'
              var f = Object.assign({}, e)
              return (
                delete f.paginate,
                'Paginate(' + l(e.paginate) + ', ' + u(f) + ')'
              )
            }
            if ('let' in e && 'in' in e)
              return (
                'Let(' +
                (Array.isArray(e.let) ? '[' + c(e.let, u) + ']' : u(e.let)) +
                ', ' +
                l(e.in) +
                ')'
              )
            if ('object' in e) return u(e.object)
            if ('merge' in e)
              return e.lambda
                ? 'Merge(' +
                    l(e.merge) +
                    ', ' +
                    l(e.with) +
                    ', ' +
                    l(e.lambda) +
                    ')'
                : 'Merge(' + l(e.merge) + ', ' + l(e.with) + ')'
            if ('lambda' in e)
              return 'Lambda(' + l(e.lambda) + ', ' + l(e.expr) + ')'
            if ('filter' in e)
              return 'Filter(' + l(e.collection) + ', ' + l(e.filter) + ')'
            if ('call' in e)
              return 'Call(' + l(e.call) + ', ' + l(e.arguments) + ')'
            if ('map' in e)
              return 'Map(' + l(e.collection) + ', ' + l(e.map) + ')'
            if ('foreach' in e)
              return 'Foreach(' + l(e.collection) + ', ' + l(e.foreach) + ')'
            var p = Object.keys(e),
              h = p[0]
            h = (function(e) {
              return (
                e in a && (e = a[e]),
                e
                  .split('_')
                  .map(function(e) {
                    return e.charAt(0).toUpperCase() + e.slice(1)
                  })
                  .join('')
              )
            })(h)
            var d = p
              .filter(t => null !== e[t] || p.length > 1)
              .map(t => l(e[t], h))
              .join(', ')
            return h + '(' + d + ')'
          }
          ;(o.toString = l), (e.exports = o)
        },
        892: (e, t, n) => {
          'use strict'
          var r = n(447),
            o = n(418)
          function i(e, t, n, r) {
            void 0 === n && (n = {}),
              void 0 === r && (r = {}),
              (this.reverse = !1),
              (this.params = {}),
              (this.before = void 0),
              (this.after = void 0),
              o(this.params, n)
            var i = this.params.cursor || this.params
            'before' in i
              ? ((this.before = i.before), delete i.before)
              : 'after' in i && ((this.after = i.after), delete i.after),
              (this.options = {}),
              o(this.options, r),
              (this.client = e),
              (this.set = t),
              (this._faunaFunctions = [])
          }
          ;(i.prototype.map = function(e) {
            var t = this._clone()
            return (
              t._faunaFunctions.push(function(t) {
                return r.Map(t, e)
              }),
              t
            )
          }),
            (i.prototype.filter = function(e) {
              var t = this._clone()
              return (
                t._faunaFunctions.push(function(t) {
                  return r.Filter(t, e)
                }),
                t
              )
            }),
            (i.prototype.each = function(e) {
              return this._retrieveNextPage(this.after, !1).then(
                this._consumePages(e, !1)
              )
            }),
            (i.prototype.eachReverse = function(e) {
              return this._retrieveNextPage(this.before, !0).then(
                this._consumePages(e, !0)
              )
            }),
            (i.prototype.previousPage = function() {
              return this._retrieveNextPage(this.before, !0).then(
                this._adjustCursors.bind(this)
              )
            }),
            (i.prototype.nextPage = function() {
              return this._retrieveNextPage(this.after, !1).then(
                this._adjustCursors.bind(this)
              )
            }),
            (i.prototype._adjustCursors = function(e) {
              return (
                void 0 !== e.after && (this.after = e.after),
                void 0 !== e.before && (this.before = e.before),
                e.data
              )
            }),
            (i.prototype._consumePages = function(e, t) {
              var n = this
              return function(r) {
                var o,
                  i = []
                return (
                  r.data.forEach(function(e) {
                    e.document && (e.instance = e.document),
                      e.value &&
                        e.value.document &&
                        (e.value.instance = e.value.document),
                      i.push(e)
                  }),
                  e(i),
                  void 0 !== (o = t ? r.before : r.after)
                    ? n._retrieveNextPage(o, t).then(n._consumePages(e, t))
                    : Promise.resolve()
                )
              }
            }),
            (i.prototype._retrieveNextPage = function(e, t) {
              var n = {}
              o(n, this.params)
              var i = n.cursor || n
              void 0 !== e
                ? t
                  ? (i.before = e)
                  : (i.after = e)
                : t && (i.before = null)
              var a = r.Paginate(this.set, n)
              return (
                this._faunaFunctions.length > 0 &&
                  this._faunaFunctions.forEach(function(e) {
                    a = e(a)
                  }),
                this.client.query(a, this.options)
              )
            }),
            (i.prototype._clone = function() {
              return Object.create(i.prototype, {
                client: { value: this.client },
                set: { value: this.set },
                _faunaFunctions: { value: this._faunaFunctions },
                before: { value: this.before },
                after: { value: this.after },
              })
            }),
            (e.exports = i)
        },
        501: e => {
          'use strict'
          function t(e, t, n, r, o, i, a, s, u, c, l) {
            ;(this.method = e),
              (this.path = t),
              (this.query = n),
              (this.requestRaw = r),
              (this.requestContent = o),
              (this.responseRaw = i),
              (this.responseContent = a),
              (this.statusCode = s),
              (this.responseHeaders = u),
              (this.startTime = c),
              (this.endTime = l)
          }
          Object.defineProperty(t.prototype, 'timeTaken', {
            get: function() {
              return this.endTime - this.startTime
            },
          }),
            (e.exports = t)
        },
        875: (e, t, n) => {
          'use strict'
          var r = n(625)
          function o(e) {
            Error.call(this),
              (this.message = e || 'Request aborted due to timeout'),
              (this.isTimeoutError = !0)
          }
          function i(e) {
            Error.call(this),
              (this.message = e || 'Request aborted'),
              (this.isAbortError = !0)
          }
          r.inherits(o, Error),
            r.inherits(i, Error),
            (e.exports = { TimeoutError: o, AbortError: i })
        },
        618: (e, t, n) => {
          'use strict'
          n(550)
          var r = n(625),
            o = n(658),
            i = n(875)
          function a(e) {
            var t
            ;(e = e || {}),
              (this.type = 'fetch'),
              (this._fetch =
                'function' == typeof (t = e.fetch)
                  ? t
                  : 'function' == typeof n.g.fetch
                  ? n.g.fetch.bind(n.g)
                  : n(98)),
              r.isNodeEnv() &&
                e.keepAlive &&
                (this._keepAliveEnabledAgent = new (e.isHttps
                  ? n(120)
                  : n(825)
                ).Agent({ keepAlive: !0 }))
          }
          function s(e, t) {
            return e && 'AbortError' === e.name
              ? t
                ? new i.TimeoutError()
                : new i.AbortError()
              : e
          }
          ;(a.prototype.execute = function(e) {
            var t,
              n = e.signal,
              i = !e.signal && !!e.timeout,
              a = function() {
                t && clearTimeout(t)
              }
            if (i) {
              var u = new AbortController()
              ;(n = u.signal), (t = setTimeout(u.abort.bind(u), e.timeout))
            }
            return this._fetch(r.formatUrl(e.origin, e.path, e.query), {
              method: e.method,
              headers: e.headers,
              body: e.body,
              agent: this._keepAliveEnabledAgent,
              signal: n,
            })
              .then(function(t) {
                a()
                var n = (function(e) {
                  var t = {}
                  for (var n of e.entries()) {
                    var r = n[0],
                      o = n[1]
                    t[r] = o
                  }
                  return t
                })(t.headers)
                return t.ok && null != e.streamConsumer
                  ? ((function(e, t) {
                      var n = function(e) {
                        t.onError(s(e))
                      }
                      if (r.isNodeEnv())
                        e.body
                          .on('error', n)
                          .on('data', t.onData)
                          .on('end', function() {
                            t.onError(new TypeError('network error'))
                          })
                      else
                        try {
                          var i = e.body.getReader(),
                            a = new TextDecoder('utf-8')
                          ;(function e() {
                            return i.read().then(function(n) {
                              if (!n.done) {
                                var r = a.decode(n.value, { stream: !0 })
                                return t.onData(r), e()
                              }
                              t.onError(new TypeError('network error'))
                            })
                          })().catch(n)
                        } catch (e) {
                          throw new o.StreamsNotSupported(
                            'Please, consider providing a Fetch API-compatible function with streamable response bodies. ' +
                              e
                          )
                        }
                    })(t, e.streamConsumer),
                    { body: '[stream]', headers: n, status: t.status })
                  : t.text().then(function(e) {
                      return { body: e, headers: n, status: t.status }
                    })
              })
              .catch(function(e) {
                return a(), Promise.reject(s(e, i))
              })
          }),
            (e.exports = a)
        },
        909: (e, t, n) => {
          'use strict'
          var r = n(994),
            o = n(875),
            i = n(625),
            a = 'stream::'
          function s() {
            ;(this.type = 'http2'), (this._sessionMap = {})
          }
          ;(s.prototype._resolveSessionFor = function(e, t) {
            var n = t ? a + e : e
            if (!this._sessionMap[n]) {
              var o = this,
                i = function() {
                  o._cleanupSessionFor(e, t)
                }
              this._sessionMap[n] = r
                .connect(e)
                .once('error', i)
                .once('goaway', i)
                .setTimeout(6e4, i)
            }
            return this._sessionMap[n]
          }),
            (s.prototype._cleanupSessionFor = function(e, t) {
              var n = t ? a + e : e
              this._sessionMap[n] &&
                (this._sessionMap[n].close(), delete this._sessionMap[n])
            }),
            (s.prototype.execute = function(e) {
              var t = this,
                n = null != e.streamConsumer
              return new Promise(function(a, s) {
                var u = !1,
                  c = !1,
                  l = function(e) {
                    ;(u = !0), a(e)
                  },
                  f = function(t) {
                    if (u && n) return e.streamConsumer.onError(t)
                    ;(u = !0), s(t)
                  },
                  p = function() {
                    e.signal && e.signal.removeEventListener('abort', h)
                  },
                  h = function() {
                    ;(c = !0),
                      p(),
                      y.close(r.constants.NGHTTP2_CANCEL),
                      f(new o.AbortError())
                  }
                try {
                  var d =
                      ('/' === e.path[0] ? e.path : '/' + e.path) +
                      i.querystringify(e.query, '?'),
                    m = Object.assign({}, e.headers, {
                      [r.constants.HTTP2_HEADER_PATH]: d,
                      [r.constants.HTTP2_HEADER_METHOD]: e.method,
                    }),
                    y = t
                      ._resolveSessionFor(e.origin, n)
                      .request(m)
                      .setEncoding('utf8')
                      .on('error', function(e) {
                        p(), f(e)
                      })
                      .on('response', function(t) {
                        var o = t[r.constants.HTTP2_HEADER_STATUS],
                          i = o >= 200 && o < 400 && n,
                          a = ''
                        i && l({ body: '[stream]', headers: t, status: o }),
                          y
                            .on('data', function(t) {
                              if (i) return e.streamConsumer.onData(t)
                              a += t
                            })
                            .on('end', function() {
                              if ((p(), !i))
                                return l({ body: a, headers: t, status: o })
                              c ||
                                e.streamConsumer.onError(
                                  new TypeError('network error')
                                )
                            })
                      })
                  !e.signal &&
                    e.timeout &&
                    y.setTimeout(e.timeout, function() {
                      ;(c = !0),
                        p(),
                        y.close(r.constants.NGHTTP2_CANCEL),
                        f(new o.TimeoutError())
                    }),
                    e.signal && e.signal.addEventListener('abort', h),
                    null != e.body && y.write(e.body),
                    y.end()
                } catch (r) {
                  t._cleanupSessionFor(e.origin, n), f(r)
                }
              })
            }),
            (e.exports = s)
        },
        656: (e, t, n) => {
          'use strict'
          var r = n(306),
            o = n(625),
            i = n(875)
          function a(e) {
            var t = 'https' === e.scheme
            null == e.port && (e.port = t ? 443 : 80)
            var i,
              a,
              s =
                !e.fetch &&
                o.isNodeEnv() &&
                (function() {
                  try {
                    return n(994), !0
                  } catch (e) {
                    return !1
                  }
                })()
            ;(this._adapter = s
              ? new (n(909))()
              : new (n(618))({
                  isHttps: t,
                  fetch: e.fetch,
                  keepAlive: e.keepAlive,
                })),
              (this._baseUrl = e.scheme + '://' + e.domain + ':' + e.port),
              (this._secret = e.secret),
              (this._headers = Object.assign(
                {},
                e.headers,
                ((a = {
                  'X-Fauna-Driver': 'Javascript',
                  'X-FaunaDB-API-Version': r.apiVersion,
                }),
                o.isNodeEnv() &&
                  ((a['X-Fauna-Driver-Version'] = r.version),
                  (a['X-Runtime-Environment'] = (i = [
                    {
                      name: 'Netlify',
                      check: () =>
                        process.env.hasOwnProperty('NETLIFY_IMAGES_CDN_DOMAIN'),
                    },
                    {
                      name: 'Vercel',
                      check: () => process.env.hasOwnProperty('VERCEL'),
                    },
                    {
                      name: 'Heroku',
                      check: () =>
                        process.env.hasOwnProperty('PATH') &&
                        -1 !== process.env.PATH.indexOf('.heroku'),
                    },
                    {
                      name: 'AWS Lambda',
                      check: () =>
                        process.env.hasOwnProperty(
                          'AWS_LAMBDA_FUNCTION_VERSION'
                        ),
                    },
                    {
                      name: 'GCP Cloud Functions',
                      check: () =>
                        process.env.hasOwnProperty('_') &&
                        -1 !== process.env._.indexOf('google'),
                    },
                    {
                      name: 'GCP Compute Instances',
                      check: () =>
                        process.env.hasOwnProperty('GOOGLE_CLOUD_PROJECT'),
                    },
                    {
                      name: 'Azure Cloud Functions',
                      check: () =>
                        process.env.hasOwnProperty(
                          'WEBSITE_FUNCTIONS_AZUREMONITOR_CATEGORIES'
                        ),
                    },
                    {
                      name: 'Azure Compute',
                      check: () =>
                        process.env.hasOwnProperty('ORYX_ENV_TYPE') &&
                        process.env.hasOwnProperty('WEBSITE_INSTANCE_ID') &&
                        'AppService' === process.env.ORYX_ENV_TYPE,
                    },
                    {
                      name: 'Worker',
                      check: () => {
                        try {
                          return n.g instanceof ServiceWorkerGlobalScope
                        } catch (e) {
                          return !1
                        }
                      },
                    },
                    {
                      name: 'Mongo Stitch',
                      check: () => 'function' == typeof n.g.StitchError,
                    },
                    {
                      name: 'Render',
                      check: () =>
                        process.env.hasOwnProperty('RENDER_SERVICE_ID'),
                    },
                    {
                      name: 'Begin',
                      check: () =>
                        process.env.hasOwnProperty('BEGIN_DATA_SCOPE_ID'),
                    },
                  ].find(e => e.check()))
                    ? i.name
                    : 'Unknown'),
                  (a['X-Runtime-Environment-OS'] = n(219).platform()),
                  (a['X-NodeJS-Version'] = process.version)),
                a)
              )),
              (this._queryTimeout = e.queryTimeout),
              (this._lastSeen = null),
              (this._timeout = Math.floor(1e3 * e.timeout))
          }
          ;(a.prototype.getLastTxnTime = function() {
            return this._lastSeen
          }),
            (a.prototype.syncLastTxnTime = function(e) {
              ;(null == this._lastSeen || this._lastSeen < e) &&
                (this._lastSeen = e)
            }),
            (a.prototype.execute = function(e) {
              if (
                (e = e || {}).streamConsumer &&
                ('function' != typeof e.streamConsumer.onData ||
                  'function' != typeof e.streamConsumer.onError)
              )
                return Promise.reject(
                  new TypeError('Invalid "streamConsumer" provided')
                )
              var t = e.secret || this._secret,
                n = e.queryTimeout || this._queryTimeout,
                r = this._headers
              return (
                (r.Authorization =
                  t &&
                  (function(e) {
                    return 'Bearer ' + e
                  })(t)),
                (r['X-Last-Seen-Txn'] = this._lastSeen),
                (r['X-Query-Timeout'] = n),
                this._adapter.execute({
                  origin: this._baseUrl,
                  path: e.path || '/',
                  query: e.query,
                  method: e.method || 'GET',
                  headers: o.removeNullAndUndefinedValues(r),
                  body: e.body,
                  signal: e.signal,
                  timeout: this._timeout,
                  streamConsumer: e.streamConsumer,
                })
              )
            }),
            (e.exports = {
              HttpClient: a,
              TimeoutError: i.TimeoutError,
              AbortError: i.AbortError,
            })
        },
        152: (e, t, n) => {
          'use strict'
          var r = n(183)
          function o(e) {
            return JSON.parse(e, i)
          }
          function i(e, t) {
            if ('object' != typeof t || null === t) return t
            if ('@ref' in t) {
              var n = t['@ref']
              if (!('collection' in n) && !('database' in n))
                return r.Native.fromName(n.id)
              var o = i(0, n.collection),
                a = i(0, n.database)
              return new r.Ref(n.id, o, a)
            }
            return '@obj' in t
              ? t['@obj']
              : '@set' in t
              ? new r.SetRef(t['@set'])
              : '@ts' in t
              ? new r.FaunaTime(t['@ts'])
              : '@date' in t
              ? new r.FaunaDate(t['@date'])
              : '@bytes' in t
              ? new r.Bytes(t['@bytes'])
              : '@query' in t
              ? new r.Query(t['@query'])
              : t
          }
          e.exports = {
            toJSON: function(e, t) {
              return (t = void 0 !== t && t)
                ? JSON.stringify(e, null, '  ')
                : JSON.stringify(e)
            },
            parseJSON: o,
            parseJSONStreaming: function(e) {
              var t = []
              try {
                t.push(o(e)), (e = '')
              } catch (i) {
                for (;;) {
                  var n = e.indexOf('\n') + 1
                  if (n <= 0) break
                  var r = e.slice(0, n).trim()
                  r.length > 0 && t.push(o(r)), (e = e.slice(n))
                }
              }
              return { values: t, buffer: e }
            },
          }
        },
        625: e => {
          'use strict'
          function t(e, t) {
            return 'object' == typeof e && null !== e && Boolean(e[t])
          }
          function n(e, n) {
            n = n || ''
            var o,
              i,
              a = []
            for (i in ('string' != typeof n && (n = '?'), e))
              if (t(e, i)) {
                if (
                  ((o = e[i]) || (null != o && !isNaN(o)) || (o = ''),
                  (i = r(i)),
                  (o = r(o)),
                  null === i || null === o)
                )
                  continue
                a.push(i + '=' + o)
              }
            return a.length ? n + a.join('&') : ''
          }
          function r(e) {
            try {
              return encodeURIComponent(e)
            } catch (e) {
              return null
            }
          }
          e.exports = {
            mergeObjects: function(e, t) {
              var n = {}
              for (var r in e) n[r] = e[r]
              for (var r in t) n[r] = t[r]
              return n
            },
            formatUrl: function(e, t, r) {
              return (
                (r = 'object' == typeof r ? n(r) : r),
                [
                  e,
                  t ? ('/' === t.charAt(0) ? '' : '/' + t) : '',
                  r ? ('?' === r.charAt(0) ? '' : '?' + r) : '',
                ].join('')
              )
            },
            querystringify: n,
            inherits: function(e, t) {
              if (null == e)
                throw new TypeError(
                  'The constructor to "inherits" must not be null or undefined'
                )
              if (null == t)
                throw new TypeError(
                  'The super constructor to "inherits" must not be null or undefined'
                )
              if (void 0 === t.prototype)
                throw new TypeError(
                  'The super constructor to "inherits" must have a prototype'
                )
              ;(e.super_ = t),
                (e.prototype = Object.create(t.prototype, {
                  constructor: {
                    value: e,
                    enumerable: !1,
                    writable: !0,
                    configurable: !0,
                  },
                }))
            },
            isNodeEnv: function() {
              return (
                'undefined' == typeof window &&
                'undefined' != typeof process &&
                null != process.versions &&
                null != process.versions.node
              )
            },
            defaults: function(e, t) {
              return void 0 === e ? t : e
            },
            applyDefaults: function(e, t) {
              var n = {}
              for (var r in e) {
                if (!(r in t)) throw new Error('No such option ' + r)
                n[r] = e[r]
              }
              for (var o in t) o in n || (n[o] = t[o])
              return n
            },
            removeNullAndUndefinedValues: function(e) {
              var t = {}
              for (var n in e) {
                var r = e[n]
                null != r && (t[n] = r)
              }
              return t
            },
            removeUndefinedValues: function(e) {
              var t = {}
              for (var n in e) {
                var r = e[n]
                void 0 !== r && (t[n] = r)
              }
              return t
            },
            checkInstanceHasProperty: t,
          }
        },
        223: (e, t, n) => {
          'use strict'
          var r = n(152)
          function o(e) {
            var t = e.query,
              n = e.method,
              r = e.path,
              o = e.requestContent,
              a = e.responseHeaders,
              s = e.responseContent,
              u = e.statusCode,
              c = e.timeTaken,
              l = ''
            function f(e) {
              l += e
            }
            return (
              f(
                'Fauna ' +
                  n +
                  ' /' +
                  r +
                  (function(e) {
                    if (null == e) return ''
                    var t = Object.keys(e)
                    return 0 === t.length
                      ? ''
                      : '?' +
                          t
                            .map(function(t) {
                              return t + '=' + e[t]
                            })
                            .join('&')
                  })(t) +
                  '\n'
              ),
              null != o && f('  Request JSON: ' + i(o) + '\n'),
              f('  Response headers: ' + i(a) + '\n'),
              f('  Response JSON: ' + i(s) + '\n'),
              f('  Response (' + u + '): Network latency ' + c + 'ms\n'),
              l
            )
          }
          function i(e) {
            return r
              .toJSON(e, !0)
              .split('\n')
              .join('\n  ')
          }
          e.exports = {
            logger: function(e) {
              return function(t, n) {
                return e(o(t), n)
              }
            },
            showRequestResult: o,
          }
        },
        658: (e, t, n) => {
          'use strict'
          var r = n(625)
          function o(e, t, n) {
            Error.call(this),
              (this.name = e),
              (this.message = t),
              (this.description = n)
          }
          function i(e) {
            o.call(this, 'InvalidValue', e)
          }
          function a(e, t, n, r) {
            var i = `${r} function requires ${(function(e, t) {
                return null === t
                  ? 'at least ' + e
                  : null === e
                  ? 'up to ' + t
                  : e === t
                  ? e
                  : 'from ' + e + ' to ' + t
              })(e, t)} argument(s) but ${n} were given`,
              a = `For more info, see the docs: https://docs.fauna.com/fauna/current/api/fql/functions/${r.toLowerCase()}`
            o.call(this, 'InvalidArity', `${i}\n${a}`),
              (this.min = e),
              (this.max = t),
              (this.actual = n)
          }
          function s(e, t) {
            var n = t.responseContent.errors,
              r = 0 === n.length ? '(empty "errors")' : n[0].code,
              i = 0 === n.length ? '(empty "errors")' : n[0].description
            o.call(this, e, r, i), (this.requestResult = t)
          }
          function u(e) {
            s.call(this, 'BadRequest', e)
          }
          function c(e) {
            s.call(this, 'Unauthorized', e)
          }
          function l(e) {
            s.call(this, 'PermissionDenied', e)
          }
          function f(e) {
            s.call(this, 'NotFound', e)
          }
          function p(e) {
            s.call(this, 'MethodNotAllowed', e)
          }
          function h(e) {
            s.call(this, 'InternalError', e)
          }
          function d(e) {
            s.call(this, 'UnavailableError', e)
          }
          function m(e, t, n) {
            o.call(this, e, t, n)
          }
          function y(e) {
            o.call(this, 'StreamsNotSupported', 'streams not supported', e)
          }
          function w(e) {
            var t = e.data || {}
            o.call(this, 'StreamErrorEvent', t.code, t.description),
              (this.event = e)
          }
          r.inherits(o, Error),
            r.inherits(i, o),
            r.inherits(a, o),
            r.inherits(s, o),
            (s.prototype.errors = function() {
              return this.requestResult.responseContent.errors
            }),
            (s.raiseForStatusCode = function(e) {
              var t = e.statusCode
              if (t < 200 || t >= 300)
                switch (t) {
                  case 400:
                    throw new u(e)
                  case 401:
                    throw new c(e)
                  case 403:
                    throw new l(e)
                  case 404:
                    throw new f(e)
                  case 405:
                    throw new p(e)
                  case 500:
                    throw new h(e)
                  case 503:
                    throw new d(e)
                  default:
                    throw new s('UnknownError', e)
                }
            }),
            r.inherits(u, s),
            r.inherits(c, s),
            r.inherits(l, s),
            r.inherits(f, s),
            r.inherits(p, s),
            r.inherits(h, s),
            r.inherits(d, s),
            r.inherits(m, o),
            r.inherits(y, m),
            r.inherits(w, m),
            (e.exports = {
              FaunaError: o,
              FaunaHTTPError: s,
              InvalidValue: i,
              InvalidArity: a,
              BadRequest: u,
              Unauthorized: c,
              PermissionDenied: l,
              NotFound: f,
              MethodNotAllowed: p,
              InternalError: h,
              UnavailableError: d,
              StreamError: m,
              StreamsNotSupported: y,
              StreamErrorEvent: w,
            })
        },
        447: (e, t, n) => {
          'use strict'
          var r = n(228),
            o = n(927),
            i = n(391),
            a = n(658),
            s = n(183),
            u = n(418),
            c = n(625)
          function l(e) {
            return m.exact(1, arguments, l.name), new i({ var: v(e) })
          }
          var f = function(e) {
            return m.exact(1, arguments, f.name), new i({ object: g(e) })
          }
          function p() {
            switch ((m.between(1, 2, arguments, p.name), arguments.length)) {
              case 1:
                var e = arguments[0]
                if ('function' == typeof e) return h(e)
                if (
                  e instanceof i ||
                  c.checkInstanceHasProperty(e, '_isFaunaExpr')
                )
                  return e
                throw new a.InvalidValue(
                  'Lambda function takes either a Function or an Expr.'
                )
              case 2:
                var t = arguments[0],
                  n = arguments[1]
                return d(t, n)
            }
          }
          function h(e) {
            var t = r(e)
            switch (t.length) {
              case 0:
                throw new a.InvalidValue(
                  'Provided Function must take at least 1 argument.'
                )
              case 1:
                return d(t[0], e(l(t[0])))
              default:
                return d(
                  t,
                  e.apply(
                    null,
                    t.map(function(e) {
                      return l(e)
                    })
                  )
                )
            }
          }
          function d(e, t) {
            return new i({ lambda: v(e), expr: v(t) })
          }
          function m(e, t, n, r) {
            if ((null !== e && n.length < e) || (null !== t && n.length > t))
              throw new a.InvalidArity(e, t, n.length, r)
          }
          function y(e, t) {
            for (var n in t) {
              var r = t[n]
              null != r && (e[n] = r)
            }
            return e
          }
          function w(e) {
            var t = Array.isArray(e) ? e : Array.prototype.slice.call(e)
            return 1 === e.length ? e[0] : t
          }
          function b(e) {
            var t = []
            return t.push.apply(t, e), t
          }
          function v(e) {
            return (
              m.exact(1, arguments, v.name),
              null === e
                ? null
                : e instanceof i ||
                  c.checkInstanceHasProperty(e, '_isFaunaExpr')
                ? e
                : 'symbol' == typeof e
                ? e.toString().replace(/Symbol\((.*)\)/, function(e, t) {
                    return t
                  })
                : 'function' == typeof e
                ? p(e)
                : Array.isArray(e)
                ? new i(
                    e.map(function(e) {
                      return v(e)
                    })
                  )
                : e instanceof Uint8Array || e instanceof ArrayBuffer
                ? new s.Bytes(e)
                : 'object' == typeof e
                ? new i({ object: g(e) })
                : e
            )
          }
          function g(e) {
            if (null !== e) {
              var t = {}
              return (
                Object.keys(e).forEach(function(n) {
                  t[n] = v(e[n])
                }),
                t
              )
            }
            return null
          }
          ;(m.exact = function(e, t, n) {
            m(e, e, t, n)
          }),
            (m.max = function(e, t, n) {
              m(null, e, t, n)
            }),
            (m.min = function(e, t, n) {
              m(e, null, t, n)
            }),
            (m.between = function(e, t, n, r) {
              m(e, t, n, r)
            }),
            (e.exports = {
              Ref: function e() {
                switch (
                  (m.between(1, 2, arguments, e.name), arguments.length)
                ) {
                  case 1:
                    return new i({ '@ref': v(arguments[0]) })
                  case 2:
                    return new i({ ref: v(arguments[0]), id: v(arguments[1]) })
                }
              },
              Bytes: function e(t) {
                return m.exact(1, arguments, e.name), new s.Bytes(t)
              },
              Abort: function e(t) {
                return m.exact(1, arguments, e.name), new i({ abort: v(t) })
              },
              At: function e(t, n) {
                return (
                  m.exact(2, arguments, e.name), new i({ at: v(t), expr: v(n) })
                )
              },
              Let: function e(t, n) {
                m.exact(2, arguments, e.name)
                var r = []
                if (
                  ((r = Array.isArray(t)
                    ? t.map(function(e) {
                        return g(e)
                      })
                    : Object.keys(t).map(function(e) {
                        var n = {}
                        return (n[e] = v(t[e])), n
                      })),
                  'function' == typeof n)
                )
                  if (Array.isArray(t)) {
                    var o = []
                    t.forEach(function(e) {
                      Object.keys(e).forEach(function(e) {
                        o.push(l(e))
                      })
                    }),
                      (n = n.apply(null, o))
                  } else
                    n = n.apply(
                      null,
                      Object.keys(t).map(function(e) {
                        return l(e)
                      })
                    )
                return new i({ let: r, in: v(n) })
              },
              Var: l,
              If: function e(t, n, r) {
                return (
                  m.exact(3, arguments, e.name),
                  new i({ if: v(t), then: v(n), else: v(r) })
                )
              },
              Do: function e() {
                m.min(1, arguments, e.name)
                var t = b(arguments)
                return new i({ do: v(t) })
              },
              Object: f,
              Lambda: p,
              Call: function e(t) {
                m.min(1, arguments, e.name)
                var n = b(arguments)
                return n.shift(), new i({ call: v(t), arguments: v(w(n)) })
              },
              Query: function e(t) {
                return m.exact(1, arguments, e.name), new i({ query: v(t) })
              },
              Map: function e(t, n) {
                return (
                  m.exact(2, arguments, e.name),
                  new i({ map: v(n), collection: v(t) })
                )
              },
              Foreach: function e(t, n) {
                return (
                  m.exact(2, arguments, e.name),
                  new i({ foreach: v(n), collection: v(t) })
                )
              },
              Filter: function e(t, n) {
                return (
                  m.exact(2, arguments, e.name),
                  new i({ filter: v(n), collection: v(t) })
                )
              },
              Take: function e(t, n) {
                return (
                  m.exact(2, arguments, e.name),
                  new i({ take: v(t), collection: v(n) })
                )
              },
              Drop: function e(t, n) {
                return (
                  m.exact(2, arguments, e.name),
                  new i({ drop: v(t), collection: v(n) })
                )
              },
              Prepend: function e(t, n) {
                return (
                  m.exact(2, arguments, e.name),
                  new i({ prepend: v(t), collection: v(n) })
                )
              },
              Append: function e(t, n) {
                return (
                  m.exact(2, arguments, e.name),
                  new i({ append: v(t), collection: v(n) })
                )
              },
              IsEmpty: function e(t) {
                return m.exact(1, arguments, e.name), new i({ is_empty: v(t) })
              },
              IsNonEmpty: function e(t) {
                return (
                  m.exact(1, arguments, e.name), new i({ is_nonempty: v(t) })
                )
              },
              IsNumber: function e(t) {
                return m.exact(1, arguments, e.name), new i({ is_number: v(t) })
              },
              IsDouble: function e(t) {
                return m.exact(1, arguments, e.name), new i({ is_double: v(t) })
              },
              IsInteger: function e(t) {
                return (
                  m.exact(1, arguments, e.name), new i({ is_integer: v(t) })
                )
              },
              IsBoolean: function e(t) {
                return (
                  m.exact(1, arguments, e.name), new i({ is_boolean: v(t) })
                )
              },
              IsNull: function e(t) {
                return m.exact(1, arguments, e.name), new i({ is_null: v(t) })
              },
              IsBytes: function e(t) {
                return m.exact(1, arguments, e.name), new i({ is_bytes: v(t) })
              },
              IsTimestamp: function e(t) {
                return (
                  m.exact(1, arguments, e.name), new i({ is_timestamp: v(t) })
                )
              },
              IsDate: function e(t) {
                return m.exact(1, arguments, e.name), new i({ is_date: v(t) })
              },
              IsString: function e(t) {
                return m.exact(1, arguments, e.name), new i({ is_string: v(t) })
              },
              IsArray: function e(t) {
                return m.exact(1, arguments, e.name), new i({ is_array: v(t) })
              },
              IsObject: function e(t) {
                return m.exact(1, arguments, e.name), new i({ is_object: v(t) })
              },
              IsRef: function e(t) {
                return m.exact(1, arguments, e.name), new i({ is_ref: v(t) })
              },
              IsSet: function e(t) {
                return m.exact(1, arguments, e.name), new i({ is_set: v(t) })
              },
              IsDoc: function e(t) {
                return m.exact(1, arguments, e.name), new i({ is_doc: v(t) })
              },
              IsLambda: function e(t) {
                return m.exact(1, arguments, e.name), new i({ is_lambda: v(t) })
              },
              IsCollection: function e(t) {
                return (
                  m.exact(1, arguments, e.name), new i({ is_collection: v(t) })
                )
              },
              IsDatabase: function e(t) {
                return (
                  m.exact(1, arguments, e.name), new i({ is_database: v(t) })
                )
              },
              IsIndex: function e(t) {
                return m.exact(1, arguments, e.name), new i({ is_index: v(t) })
              },
              IsFunction: function e(t) {
                return (
                  m.exact(1, arguments, e.name), new i({ is_function: v(t) })
                )
              },
              IsKey: function e(t) {
                return m.exact(1, arguments, e.name), new i({ is_key: v(t) })
              },
              IsToken: function e(t) {
                return m.exact(1, arguments, e.name), new i({ is_token: v(t) })
              },
              IsCredentials: function e(t) {
                return (
                  m.exact(1, arguments, e.name), new i({ is_credentials: v(t) })
                )
              },
              IsRole: function e(t) {
                return m.exact(1, arguments, e.name), new i({ is_role: v(t) })
              },
              Get: function e(t, n) {
                return (
                  m.between(1, 2, arguments, e.name),
                  (n = c.defaults(n, null)),
                  new i(y({ get: v(t) }, { ts: v(n) }))
                )
              },
              KeyFromSecret: function e(t) {
                return (
                  m.exact(1, arguments, e.name),
                  new i({ key_from_secret: v(t) })
                )
              },
              Reduce: function e(t, n, r) {
                return (
                  m.exact(3, arguments, e.name),
                  new i({ reduce: v(t), initial: v(n), collection: v(r) })
                )
              },
              Paginate: function e(t, n) {
                return (
                  m.between(1, 2, arguments, e.name),
                  (n = c.defaults(n, {})),
                  new i(u({ paginate: v(t) }, g(n)))
                )
              },
              Exists: function e(t, n) {
                return (
                  m.between(1, 2, arguments, e.name),
                  (n = c.defaults(n, null)),
                  new i(y({ exists: v(t) }, { ts: v(n) }))
                )
              },
              Create: function e(t, n) {
                return (
                  m.between(1, 2, arguments, e.name),
                  new i({ create: v(t), params: v(n) })
                )
              },
              Update: function e(t, n) {
                return (
                  m.exact(2, arguments, e.name),
                  new i({ update: v(t), params: v(n) })
                )
              },
              Replace: function e(t, n) {
                return (
                  m.exact(2, arguments, e.name),
                  new i({ replace: v(t), params: v(n) })
                )
              },
              Delete: function e(t) {
                return m.exact(1, arguments, e.name), new i({ delete: v(t) })
              },
              Insert: function e(t, n, r, o) {
                return (
                  m.exact(4, arguments, e.name),
                  new i({ insert: v(t), ts: v(n), action: v(r), params: v(o) })
                )
              },
              Remove: function e(t, n, r) {
                return (
                  m.exact(3, arguments, e.name),
                  new i({ remove: v(t), ts: v(n), action: v(r) })
                )
              },
              CreateClass: o(function e(t) {
                return (
                  m.exact(1, arguments, e.name), new i({ create_class: v(t) })
                )
              }, 'CreateClass() is deprecated, use CreateCollection() instead'),
              CreateCollection: function e(t) {
                return (
                  m.exact(1, arguments, e.name),
                  new i({ create_collection: v(t) })
                )
              },
              CreateDatabase: function e(t) {
                return (
                  m.exact(1, arguments, e.name),
                  new i({ create_database: v(t) })
                )
              },
              CreateIndex: function e(t) {
                return (
                  m.exact(1, arguments, e.name), new i({ create_index: v(t) })
                )
              },
              CreateKey: function e(t) {
                return (
                  m.exact(1, arguments, e.name), new i({ create_key: v(t) })
                )
              },
              CreateFunction: function e(t) {
                return (
                  m.exact(1, arguments, e.name),
                  new i({ create_function: v(t) })
                )
              },
              CreateRole: function e(t) {
                return (
                  m.exact(1, arguments, e.name), new i({ create_role: v(t) })
                )
              },
              CreateAccessProvider: function e(t) {
                return (
                  m.exact(1, arguments, e.name),
                  new i({ create_access_provider: v(t) })
                )
              },
              Singleton: function e(t) {
                return m.exact(1, arguments, e.name), new i({ singleton: v(t) })
              },
              Events: function e(t) {
                return m.exact(1, arguments, e.name), new i({ events: v(t) })
              },
              Match: function e(t) {
                m.min(1, arguments, e.name)
                var n = b(arguments)
                return n.shift(), new i({ match: v(t), terms: v(w(n)) })
              },
              Union: function e() {
                return (
                  m.min(1, arguments, e.name), new i({ union: v(w(arguments)) })
                )
              },
              Merge: function e(t, n, r) {
                return (
                  m.between(2, 3, arguments, e.name),
                  new i(y({ merge: v(t), with: v(n) }, { lambda: v(r) }))
                )
              },
              Intersection: function e() {
                return (
                  m.min(1, arguments, e.name),
                  new i({ intersection: v(w(arguments)) })
                )
              },
              Difference: function e() {
                return (
                  m.min(1, arguments, e.name),
                  new i({ difference: v(w(arguments)) })
                )
              },
              Distinct: function e(t) {
                return m.exact(1, arguments, e.name), new i({ distinct: v(t) })
              },
              Join: function e(t, n) {
                return (
                  m.exact(2, arguments, e.name),
                  new i({ join: v(t), with: v(n) })
                )
              },
              Range: function e(t, n, r) {
                return (
                  m.exact(3, arguments, e.name),
                  new i({ range: v(t), from: v(n), to: v(r) })
                )
              },
              Login: function e(t, n) {
                return (
                  m.exact(2, arguments, e.name),
                  new i({ login: v(t), params: v(n) })
                )
              },
              Logout: function e(t) {
                return m.exact(1, arguments, e.name), new i({ logout: v(t) })
              },
              Identify: function e(t, n) {
                return (
                  m.exact(2, arguments, e.name),
                  new i({ identify: v(t), password: v(n) })
                )
              },
              Identity: o(function e() {
                return m.exact(0, arguments, e.name), new i({ identity: null })
              }, 'Identity() is deprecated, use CurrentIdentity() instead'),
              CurrentIdentity: function e() {
                return (
                  m.exact(0, arguments, e.name),
                  new i({ current_identity: null })
                )
              },
              HasIdentity: o(function e() {
                return (
                  m.exact(0, arguments, e.name), new i({ has_identity: null })
                )
              }, 'HasIdentity() is deprecated, use HasCurrentIdentity() instead'),
              HasCurrentIdentity: function e() {
                return (
                  m.exact(0, arguments, e.name),
                  new i({ has_current_identity: null })
                )
              },
              CurrentToken: function e() {
                return (
                  m.exact(0, arguments, e.name), new i({ current_token: null })
                )
              },
              HasCurrentToken: function e() {
                return (
                  m.exact(0, arguments, e.name),
                  new i({ has_current_token: null })
                )
              },
              Concat: function e(t, n) {
                return (
                  m.min(1, arguments, e.name),
                  (n = c.defaults(n, null)),
                  new i(y({ concat: v(t) }, { separator: v(n) }))
                )
              },
              Casefold: function e(t, n) {
                return (
                  m.min(1, arguments, e.name),
                  new i(y({ casefold: v(t) }, { normalizer: v(n) }))
                )
              },
              ContainsStr: function e(t, n) {
                return (
                  m.exact(2, arguments, e.name),
                  new i({ containsstr: v(t), search: v(n) })
                )
              },
              ContainsStrRegex: function e(t, n) {
                return (
                  m.exact(2, arguments, e.name),
                  new i({ containsstrregex: v(t), pattern: v(n) })
                )
              },
              StartsWith: function e(t, n) {
                return (
                  m.exact(2, arguments, e.name),
                  new i({ startswith: v(t), search: v(n) })
                )
              },
              EndsWith: function e(t, n) {
                return (
                  m.exact(2, arguments, e.name),
                  new i({ endswith: v(t), search: v(n) })
                )
              },
              FindStr: function e(t, n, r) {
                return (
                  m.between(2, 3, arguments, e.name),
                  (r = c.defaults(r, null)),
                  new i(y({ findstr: v(t), find: v(n) }, { start: v(r) }))
                )
              },
              FindStrRegex: function e(t, n, r, o) {
                return (
                  m.between(2, 4, arguments, e.name),
                  (r = c.defaults(r, null)),
                  new i(
                    y(
                      { findstrregex: v(t), pattern: v(n) },
                      { start: v(r), num_results: v(o) }
                    )
                  )
                )
              },
              Length: function e(t) {
                return m.exact(1, arguments, e.name), new i({ length: v(t) })
              },
              LowerCase: function e(t) {
                return m.exact(1, arguments, e.name), new i({ lowercase: v(t) })
              },
              LTrim: function e(t) {
                return m.exact(1, arguments, e.name), new i({ ltrim: v(t) })
              },
              NGram: function e(t, n, r) {
                return (
                  m.between(1, 3, arguments, e.name),
                  (n = c.defaults(n, null)),
                  (r = c.defaults(r, null)),
                  new i(y({ ngram: v(t) }, { min: v(n), max: v(r) }))
                )
              },
              Repeat: function e(t, n) {
                return (
                  m.between(1, 2, arguments, e.name),
                  (n = c.defaults(n, null)),
                  new i(y({ repeat: v(t) }, { number: v(n) }))
                )
              },
              ReplaceStr: function e(t, n, r) {
                return (
                  m.exact(3, arguments, e.name),
                  new i({ replacestr: v(t), find: v(n), replace: v(r) })
                )
              },
              ReplaceStrRegex: function e(t, n, r, o) {
                return (
                  m.between(3, 4, arguments, e.name),
                  (o = c.defaults(o, null)),
                  new i(
                    y(
                      { replacestrregex: v(t), pattern: v(n), replace: v(r) },
                      { first: v(o) }
                    )
                  )
                )
              },
              RegexEscape: function e(t) {
                return (
                  m.exact(1, arguments, e.name), new i({ regexescape: v(t) })
                )
              },
              RTrim: function e(t) {
                return m.exact(1, arguments, e.name), new i({ rtrim: v(t) })
              },
              Space: function e(t) {
                return m.exact(1, arguments, e.name), new i({ space: v(t) })
              },
              SubString: function e(t, n, r) {
                return (
                  m.between(1, 3, arguments, e.name),
                  (n = c.defaults(n, null)),
                  (r = c.defaults(r, null)),
                  new i(y({ substring: v(t) }, { start: v(n), length: v(r) }))
                )
              },
              TitleCase: function e(t) {
                return m.exact(1, arguments, e.name), new i({ titlecase: v(t) })
              },
              Trim: function e(t) {
                return m.exact(1, arguments, e.name), new i({ trim: v(t) })
              },
              UpperCase: function e(t) {
                return m.exact(1, arguments, e.name), new i({ uppercase: v(t) })
              },
              Format: function e(t) {
                m.min(1, arguments, e.name)
                var n = b(arguments)
                return n.shift(), new i({ format: v(t), values: v(w(n)) })
              },
              Time: function e(t) {
                return m.exact(1, arguments, e.name), new i({ time: v(t) })
              },
              TimeAdd: function e(t, n, r) {
                return (
                  m.exact(3, arguments, e.name),
                  new i({ time_add: v(t), offset: v(n), unit: v(r) })
                )
              },
              TimeSubtract: function e(t, n, r) {
                return (
                  m.exact(3, arguments, e.name),
                  new i({ time_subtract: v(t), offset: v(n), unit: v(r) })
                )
              },
              TimeDiff: function e(t, n, r) {
                return (
                  m.exact(3, arguments, e.name),
                  new i({ time_diff: v(t), other: v(n), unit: v(r) })
                )
              },
              Epoch: function e(t, n) {
                return (
                  m.exact(2, arguments, e.name),
                  new i({ epoch: v(t), unit: v(n) })
                )
              },
              Date: function e(t) {
                return m.exact(1, arguments, e.name), new i({ date: v(t) })
              },
              Now: function e() {
                return m.exact(0, arguments, e.name), new i({ now: v(null) })
              },
              NextId: o(function e() {
                return m.exact(0, arguments, e.name), new i({ next_id: null })
              }, 'NextId() is deprecated, use NewId() instead'),
              NewId: function e() {
                return m.exact(0, arguments, e.name), new i({ new_id: null })
              },
              Database: function e(t, n) {
                switch (
                  (m.between(1, 2, arguments, e.name), arguments.length)
                ) {
                  case 1:
                    return new i({ database: v(t) })
                  case 2:
                    return new i({ database: v(t), scope: v(n) })
                }
              },
              Index: function e(t, n) {
                switch (
                  (m.between(1, 2, arguments, e.name), arguments.length)
                ) {
                  case 1:
                    return new i({ index: v(t) })
                  case 2:
                    return new i({ index: v(t), scope: v(n) })
                }
              },
              Class: o(function e(t, n) {
                switch (
                  (m.between(1, 2, arguments, e.name), arguments.length)
                ) {
                  case 1:
                    return new i({ class: v(t) })
                  case 2:
                    return new i({ class: v(t), scope: v(n) })
                }
              }, 'Class() is deprecated, use Collection() instead'),
              Collection: function e(t, n) {
                switch (
                  (m.between(1, 2, arguments, e.name), arguments.length)
                ) {
                  case 1:
                    return new i({ collection: v(t) })
                  case 2:
                    return new i({ collection: v(t), scope: v(n) })
                }
              },
              Function: function e(t, n) {
                switch (
                  (m.between(1, 2, arguments, e.name), arguments.length)
                ) {
                  case 1:
                    return new i({ function: v(t) })
                  case 2:
                    return new i({ function: v(t), scope: v(n) })
                }
              },
              Role: function e(t, n) {
                return (
                  m.between(1, 2, arguments, e.name),
                  (n = c.defaults(n, null)),
                  new i(y({ role: v(t) }, { scope: v(n) }))
                )
              },
              AccessProviders: function e(t) {
                return (
                  m.max(1, arguments, e.name),
                  (t = c.defaults(t, null)),
                  new i({ access_providers: v(t) })
                )
              },
              Classes: o(function e(t) {
                return (
                  m.max(1, arguments, e.name),
                  (t = c.defaults(t, null)),
                  new i({ classes: v(t) })
                )
              }, 'Classes() is deprecated, use Collections() instead'),
              Collections: function e(t) {
                return (
                  m.max(1, arguments, e.name),
                  (t = c.defaults(t, null)),
                  new i({ collections: v(t) })
                )
              },
              Databases: function e(t) {
                return (
                  m.max(1, arguments, e.name),
                  (t = c.defaults(t, null)),
                  new i({ databases: v(t) })
                )
              },
              Indexes: function e(t) {
                return (
                  m.max(1, arguments, e.name),
                  (t = c.defaults(t, null)),
                  new i({ indexes: v(t) })
                )
              },
              Functions: function e(t) {
                return (
                  m.max(1, arguments, e.name),
                  (t = c.defaults(t, null)),
                  new i({ functions: v(t) })
                )
              },
              Roles: function e(t) {
                return (
                  m.max(1, arguments, e.name),
                  (t = c.defaults(t, null)),
                  new i({ roles: v(t) })
                )
              },
              Keys: function e(t) {
                return (
                  m.max(1, arguments, e.name),
                  (t = c.defaults(t, null)),
                  new i({ keys: v(t) })
                )
              },
              Tokens: function e(t) {
                return (
                  m.max(1, arguments, e.name),
                  (t = c.defaults(t, null)),
                  new i({ tokens: v(t) })
                )
              },
              Credentials: function e(t) {
                return (
                  m.max(1, arguments, e.name),
                  (t = c.defaults(t, null)),
                  new i({ credentials: v(t) })
                )
              },
              Equals: function e() {
                return (
                  m.min(1, arguments, e.name),
                  new i({ equals: v(w(arguments)) })
                )
              },
              Contains: o(function e(t, n) {
                return (
                  m.exact(2, arguments, e.name),
                  new i({ contains: v(t), in: v(n) })
                )
              }, 'Contains() is deprecated, use ContainsPath() instead'),
              ContainsPath: function e(t, n) {
                return (
                  m.exact(2, arguments, e.name),
                  new i({ contains_path: v(t), in: v(n) })
                )
              },
              ContainsField: function e(t, n) {
                return (
                  m.exact(2, arguments, e.name),
                  new i({ contains_field: v(t), in: v(n) })
                )
              },
              ContainsValue: function e(t, n) {
                return (
                  m.exact(2, arguments, e.name),
                  new i({ contains_value: v(t), in: v(n) })
                )
              },
              Select: function e(t, n, r) {
                m.between(2, 3, arguments, e.name)
                var o = { select: v(t), from: v(n) }
                return void 0 !== r && (o.default = v(r)), new i(o)
              },
              SelectAll: o(function e(t, n) {
                return (
                  m.exact(2, arguments, e.name),
                  new i({ select_all: v(t), from: v(n) })
                )
              }, 'SelectAll() is deprecated. Avoid use.'),
              Abs: function e(t) {
                return m.exact(1, arguments, e.name), new i({ abs: v(t) })
              },
              Add: function e() {
                return (
                  m.min(1, arguments, e.name), new i({ add: v(w(arguments)) })
                )
              },
              BitAnd: function e() {
                return (
                  m.min(1, arguments, e.name),
                  new i({ bitand: v(w(arguments)) })
                )
              },
              BitNot: function e(t) {
                return m.exact(1, arguments, e.name), new i({ bitnot: v(t) })
              },
              BitOr: function e() {
                return (
                  m.min(1, arguments, e.name), new i({ bitor: v(w(arguments)) })
                )
              },
              BitXor: function e() {
                return (
                  m.min(1, arguments, e.name),
                  new i({ bitxor: v(w(arguments)) })
                )
              },
              Ceil: function e(t) {
                return m.exact(1, arguments, e.name), new i({ ceil: v(t) })
              },
              Divide: function e() {
                return (
                  m.min(1, arguments, e.name),
                  new i({ divide: v(w(arguments)) })
                )
              },
              Floor: function e(t) {
                return m.exact(1, arguments, e.name), new i({ floor: v(t) })
              },
              Max: function e() {
                return (
                  m.min(1, arguments, e.name), new i({ max: v(w(arguments)) })
                )
              },
              Min: function e() {
                return (
                  m.min(1, arguments, e.name), new i({ min: v(w(arguments)) })
                )
              },
              Modulo: function e() {
                return (
                  m.min(1, arguments, e.name),
                  new i({ modulo: v(w(arguments)) })
                )
              },
              Multiply: function e() {
                return (
                  m.min(1, arguments, e.name),
                  new i({ multiply: v(w(arguments)) })
                )
              },
              Round: function e(t, n) {
                return (
                  m.min(1, arguments, e.name),
                  (n = c.defaults(n, null)),
                  new i(y({ round: v(t) }, { precision: v(n) }))
                )
              },
              Subtract: function e() {
                return (
                  m.min(1, arguments, e.name),
                  new i({ subtract: v(w(arguments)) })
                )
              },
              Sign: function e(t) {
                return m.exact(1, arguments, e.name), new i({ sign: v(t) })
              },
              Sqrt: function e(t) {
                return m.exact(1, arguments, e.name), new i({ sqrt: v(t) })
              },
              Trunc: function e(t, n) {
                return (
                  m.min(1, arguments, e.name),
                  (n = c.defaults(n, null)),
                  new i(y({ trunc: v(t) }, { precision: v(n) }))
                )
              },
              Count: function e(t) {
                return m.exact(1, arguments, e.name), new i({ count: v(t) })
              },
              Sum: function e(t) {
                return m.exact(1, arguments, e.name), new i({ sum: v(t) })
              },
              Mean: function e(t) {
                return m.exact(1, arguments, e.name), new i({ mean: v(t) })
              },
              Any: function e(t) {
                return m.exact(1, arguments, e.name), new i({ any: v(t) })
              },
              All: function e(t) {
                return m.exact(1, arguments, e.name), new i({ all: v(t) })
              },
              Acos: function e(t) {
                return m.exact(1, arguments, e.name), new i({ acos: v(t) })
              },
              Asin: function e(t) {
                return m.exact(1, arguments, e.name), new i({ asin: v(t) })
              },
              Atan: function e(t) {
                return m.exact(1, arguments, e.name), new i({ atan: v(t) })
              },
              Cos: function e(t) {
                return m.exact(1, arguments, e.name), new i({ cos: v(t) })
              },
              Cosh: function e(t) {
                return m.exact(1, arguments, e.name), new i({ cosh: v(t) })
              },
              Degrees: function e(t) {
                return m.exact(1, arguments, e.name), new i({ degrees: v(t) })
              },
              Exp: function e(t) {
                return m.exact(1, arguments, e.name), new i({ exp: v(t) })
              },
              Hypot: function e(t, n) {
                return (
                  m.min(1, arguments, e.name),
                  (n = c.defaults(n, null)),
                  new i(y({ hypot: v(t) }, { b: v(n) }))
                )
              },
              Ln: function e(t) {
                return m.exact(1, arguments, e.name), new i({ ln: v(t) })
              },
              Log: function e(t) {
                return m.exact(1, arguments, e.name), new i({ log: v(t) })
              },
              Pow: function e(t, n) {
                return (
                  m.min(1, arguments, e.name),
                  (n = c.defaults(n, null)),
                  new i(y({ pow: v(t) }, { exp: v(n) }))
                )
              },
              Radians: function e(t) {
                return m.exact(1, arguments, e.name), new i({ radians: v(t) })
              },
              Sin: function e(t) {
                return m.exact(1, arguments, e.name), new i({ sin: v(t) })
              },
              Sinh: function e(t) {
                return m.exact(1, arguments, e.name), new i({ sinh: v(t) })
              },
              Tan: function e(t) {
                return m.exact(1, arguments, e.name), new i({ tan: v(t) })
              },
              Tanh: function e(t) {
                return m.exact(1, arguments, e.name), new i({ tanh: v(t) })
              },
              LT: function e() {
                return (
                  m.min(1, arguments, e.name), new i({ lt: v(w(arguments)) })
                )
              },
              LTE: function e() {
                return (
                  m.min(1, arguments, e.name), new i({ lte: v(w(arguments)) })
                )
              },
              GT: function e() {
                return (
                  m.min(1, arguments, e.name), new i({ gt: v(w(arguments)) })
                )
              },
              GTE: function e() {
                return (
                  m.min(1, arguments, e.name), new i({ gte: v(w(arguments)) })
                )
              },
              And: function e() {
                return (
                  m.min(1, arguments, e.name), new i({ and: v(w(arguments)) })
                )
              },
              Or: function e() {
                return (
                  m.min(1, arguments, e.name), new i({ or: v(w(arguments)) })
                )
              },
              Not: function e(t) {
                return m.exact(1, arguments, e.name), new i({ not: v(t) })
              },
              ToString: function e(t) {
                return m.exact(1, arguments, e.name), new i({ to_string: v(t) })
              },
              ToNumber: function e(t) {
                return m.exact(1, arguments, e.name), new i({ to_number: v(t) })
              },
              ToObject: function e(t) {
                return m.exact(1, arguments, e.name), new i({ to_object: v(t) })
              },
              ToArray: function e(t) {
                return m.exact(1, arguments, e.name), new i({ to_array: v(t) })
              },
              ToDouble: function e(t) {
                return m.exact(1, arguments, e.name), new i({ to_double: v(t) })
              },
              ToInteger: function e(t) {
                return (
                  m.exact(1, arguments, e.name), new i({ to_integer: v(t) })
                )
              },
              ToTime: function e(t) {
                return m.exact(1, arguments, e.name), new i({ to_time: v(t) })
              },
              ToSeconds: function e(t) {
                return (
                  m.exact(1, arguments, e.name), new i({ to_seconds: v(t) })
                )
              },
              ToMicros: function e(t) {
                return m.exact(1, arguments, e.name), new i({ to_micros: v(t) })
              },
              ToMillis: function e(t) {
                return m.exact(1, arguments, e.name), new i({ to_millis: v(t) })
              },
              DayOfMonth: function e(t) {
                return (
                  m.exact(1, arguments, e.name), new i({ day_of_month: v(t) })
                )
              },
              DayOfWeek: function e(t) {
                return (
                  m.exact(1, arguments, e.name), new i({ day_of_week: v(t) })
                )
              },
              DayOfYear: function e(t) {
                return (
                  m.exact(1, arguments, e.name), new i({ day_of_year: v(t) })
                )
              },
              Second: function e(t) {
                return m.exact(1, arguments, e.name), new i({ second: v(t) })
              },
              Minute: function e(t) {
                return m.exact(1, arguments, e.name), new i({ minute: v(t) })
              },
              Hour: function e(t) {
                return m.exact(1, arguments, e.name), new i({ hour: v(t) })
              },
              Month: function e(t) {
                return m.exact(1, arguments, e.name), new i({ month: v(t) })
              },
              Year: function e(t) {
                return m.exact(1, arguments, e.name), new i({ year: v(t) })
              },
              ToDate: function e(t) {
                return m.exact(1, arguments, e.name), new i({ to_date: v(t) })
              },
              MoveDatabase: function e(t, n) {
                return (
                  m.exact(2, arguments, e.name),
                  new i({ move_database: v(t), to: v(n) })
                )
              },
              Documents: function e(t) {
                return m.exact(1, arguments, e.name), new i({ documents: v(t) })
              },
              Reverse: function e(t) {
                return m.exact(1, arguments, e.name), new i({ reverse: v(t) })
              },
              AccessProvider: function e(t) {
                return (
                  m.exact(1, arguments, e.name),
                  new i({ access_provider: v(t) })
                )
              },
              wrap: v,
            })
        },
        229: (e, t, n) => {
          'use strict'
          n(550)
          var r = n(501),
            o = n(658),
            i = n(152),
            a = n(656),
            s = n(447),
            u = n(625),
            c = ['start', 'error', 'version', 'history_rewrite'],
            l = c.concat(['snapshot'])
          function f(e, t, n, r) {
            ;(n = u.applyDefaults(n, { fields: null })),
              (this._client = e),
              (this._onEvent = r),
              (this._query = s.wrap(t)),
              (this._urlParams = n.fields
                ? { fields: n.fields.join(',') }
                : null),
              (this._abort = new AbortController()),
              (this._state = 'idle')
          }
          function p(e) {
            ;(this._allowedEvents = e), (this._listeners = {})
          }
          function h(e, t) {
            ;(this._client = e), (this._dispatcher = t)
          }
          ;(f.prototype.snapshot = function() {
            var e = this
            e._client
              .query(s.Get(e._query))
              .then(function(t) {
                e._onEvent({ type: 'snapshot', event: t })
              })
              .catch(function(t) {
                e._onEvent({ type: 'error', event: t })
              })
          }),
            (f.prototype.subscribe = function() {
              var e = this
              if ('idle' !== e._state)
                throw new Error(
                  'Subscription#start should not be called several times, consider instantiating a new stream instead.'
                )
              e._state = 'open'
              var t = JSON.stringify(e._query),
                n = Date.now(),
                s = ''
              function u(t) {
                t instanceof a.AbortError ||
                  e._onEvent({ type: 'error', event: t })
              }
              e._client._http
                .execute({
                  method: 'POST',
                  path: 'stream',
                  body: t,
                  query: e._urlParams,
                  signal: this._abort.signal,
                  streamConsumer: {
                    onError: u,
                    onData: function(t) {
                      var n = i.parseJSONStreaming(s + t)
                      ;(s = n.buffer),
                        n.values.forEach(function(t) {
                          void 0 !== t.txn && e._client.syncLastTxnTime(t.txn),
                            'error' === t.event
                              ? u(new o.StreamErrorEvent(t))
                              : e._onEvent(t)
                        })
                    },
                  },
                })
                .then(function(o) {
                  var a,
                    s = Date.now()
                  try {
                    a = i.parseJSON(o.body)
                  } catch (e) {
                    a = o.body
                  }
                  var u = new r(
                    'POST',
                    'stream',
                    e._urlParams,
                    t,
                    e._query,
                    o.body,
                    a,
                    o.status,
                    o.headers,
                    n,
                    s
                  )
                  e._client._handleRequestResult(o, u)
                })
                .catch(u)
            }),
            (f.prototype.close = function() {
              'closed' !== this._state &&
                ((this._state = 'closed'), this._abort.abort())
            }),
            (p.prototype.on = function(e, t) {
              if (-1 === this._allowedEvents.indexOf(e))
                throw new Error('Unknown event type: ' + e)
              void 0 === this._listeners[e] && (this._listeners[e] = []),
                this._listeners[e].push(t)
            }),
            (p.prototype.dispatch = function(e) {
              var t = this._listeners[e.type]
              if (t)
                for (var n = 0; n < t.length; n++) t[n].call(null, e.event, e)
            }),
            (h.prototype.on = function(e, t) {
              return this._dispatcher.on(e, t), this
            }),
            (h.prototype.start = function() {
              return this._client.subscribe(), this
            }),
            (h.prototype.close = function() {
              this._client.close()
            }),
            (e.exports = {
              StreamAPI: function(e) {
                var t = function(t, n) {
                  var r = new p(c)
                  return new h(
                    new f(e, t, n, function(e) {
                      r.dispatch(e)
                    }),
                    r
                  )
                }
                return (
                  (t.document = function(t, n) {
                    var r = [],
                      o = !0,
                      i = new p(l),
                      a = new f(e, t, n, function(e) {
                        switch (e.type) {
                          case 'start':
                            i.dispatch(e), a.snapshot()
                            break
                          case 'snapshot':
                            !(function(e) {
                              i.dispatch(e)
                              for (var t = 0; t < r.length; t++) {
                                var n = r[t]
                                n.txn > e.event.ts && i.dispatch(n)
                              }
                              ;(o = !1), (r = null)
                            })(e)
                            break
                          case 'error':
                            i.dispatch(e)
                            break
                          default:
                            o ? r.push(e) : i.dispatch(e)
                        }
                      })
                    return new h(a, i)
                  }),
                  t
                )
              },
            })
        },
        183: (e, t, n) => {
          'use strict'
          var r = n(742),
            o = n(927),
            i = n(658),
            a = n(391),
            s = n(625),
            u = s.isNodeEnv() ? n(758) : null,
            c = u && u.inspect.custom,
            l = u ? u.inspect : JSON.stringify
          function f() {}
          function p(e, t, n) {
            if (!e) throw new i.InvalidValue('id cannot be null or undefined')
            ;(this.value = { id: e }),
              t && (this.value.collection = t),
              n && (this.value.database = n)
          }
          ;(f.prototype._isFaunaValue = !0),
            s.inherits(f, a),
            (p.prototype._isFaunaRef = !0),
            s.inherits(p, f),
            Object.defineProperty(p.prototype, 'collection', {
              get: function() {
                return this.value.collection
              },
            }),
            Object.defineProperty(p.prototype, 'class', {
              get: o(function() {
                return this.value.collection
              }, 'class is deprecated, use collection instead'),
            }),
            Object.defineProperty(p.prototype, 'database', {
              get: function() {
                return this.value.database
              },
            }),
            Object.defineProperty(p.prototype, 'id', {
              get: function() {
                return this.value.id
              },
            }),
            (p.prototype.toJSON = function() {
              return { '@ref': this.value }
            }),
            v(p, function() {
              var e = {
                  collections: 'Collection',
                  databases: 'Database',
                  indexes: 'Index',
                  functions: 'Function',
                  roles: 'Role',
                  access_providers: 'AccessProvider',
                },
                t = function(e) {
                  return void 0 === e.collection
                },
                n = function(r) {
                  if (t(r)) {
                    var o = void 0 !== r.database ? r.database.toString() : ''
                    return 'access_providers' === r.id
                      ? 'AccessProviders(' + o + ')'
                      : r.id.charAt(0).toUpperCase() +
                          r.id.slice(1) +
                          '(' +
                          o +
                          ')'
                  }
                  if (t(r.collection)) {
                    var i = e[r.collection.id]
                    if (void 0 !== i)
                      return (
                        (o =
                          void 0 !== r.database
                            ? ', ' + r.database.toString()
                            : ''),
                        i + '("' + r.id + '"' + o + ')'
                      )
                  }
                  return 'Ref(' + n(r.collection) + ', "' + r.id + '")'
                }
              return n(this)
            }),
            (p.prototype.valueOf = function() {
              return this.value
            }),
            (p.prototype.equals = function(e) {
              return (
                (e instanceof p ||
                  s.checkInstanceHasProperty(e, '_isFaunaRef')) &&
                this.id === e.id &&
                ((void 0 === this.collection && void 0 === e.collection) ||
                  this.collection.equals(e.collection)) &&
                ((void 0 === this.database && void 0 === e.database) ||
                  this.database.equals(e.database))
              )
            })
          var h = {
            COLLECTIONS: new p('collections'),
            INDEXES: new p('indexes'),
            DATABASES: new p('databases'),
            FUNCTIONS: new p('functions'),
            ROLES: new p('roles'),
            KEYS: new p('keys'),
            ACCESS_PROVIDERS: new p('access_providers'),
          }
          function d(e) {
            this.value = e
          }
          function m(e) {
            if (e instanceof Date) e = e.toISOString()
            else if ('Z' !== e.charAt(e.length - 1))
              throw new i.InvalidValue(
                "Only allowed timezone is 'Z', got: " + e
              )
            this.value = e
          }
          function y(e) {
            e instanceof Date && (e = e.toISOString().slice(0, 10)),
              (this.value = e)
          }
          function w(e) {
            if (e instanceof ArrayBuffer) this.value = new Uint8Array(e)
            else if ('string' == typeof e) this.value = r.toByteArray(e)
            else {
              if (!(e instanceof Uint8Array))
                throw new i.InvalidValue(
                  'Bytes type expect argument to be either Uint8Array|ArrayBuffer|string, got: ' +
                    l(e)
                )
              this.value = e
            }
          }
          function b(e) {
            this.value = e
          }
          function v(e, t) {
            ;(e.prototype.toString = t),
              (e.prototype.inspect = t),
              c && (e.prototype[c] = t)
          }
          ;(h.fromName = function(e) {
            switch (e) {
              case 'collections':
                return h.COLLECTIONS
              case 'indexes':
                return h.INDEXES
              case 'databases':
                return h.DATABASES
              case 'functions':
                return h.FUNCTIONS
              case 'roles':
                return h.ROLES
              case 'keys':
                return h.KEYS
              case 'access_providers':
                return h.ACCESS_PROVIDERS
            }
            return new p(e)
          }),
            s.inherits(d, f),
            v(d, function() {
              return a.toString(this.value)
            }),
            (d.prototype.toJSON = function() {
              return { '@set': this.value }
            }),
            s.inherits(m, f),
            Object.defineProperty(m.prototype, 'date', {
              get: function() {
                return new Date(this.value)
              },
            }),
            v(m, function() {
              return 'Time("' + this.value + '")'
            }),
            (m.prototype.toJSON = function() {
              return { '@ts': this.value }
            }),
            s.inherits(y, f),
            Object.defineProperty(y.prototype, 'date', {
              get: function() {
                return new Date(this.value)
              },
            }),
            v(y, function() {
              return 'Date("' + this.value + '")'
            }),
            (y.prototype.toJSON = function() {
              return { '@date': this.value }
            }),
            s.inherits(w, f),
            v(w, function() {
              return 'Bytes("' + r.fromByteArray(this.value) + '")'
            }),
            (w.prototype.toJSON = function() {
              return { '@bytes': r.fromByteArray(this.value) }
            }),
            s.inherits(b, f),
            v(b, function() {
              return 'Query(' + a.toString(this.value) + ')'
            }),
            (b.prototype.toJSON = function() {
              return { '@query': this.value }
            }),
            (e.exports = {
              Value: f,
              Ref: p,
              Native: h,
              SetRef: d,
              FaunaTime: m,
              FaunaDate: y,
              Bytes: w,
              Query: b,
            })
        },
        825: () => {},
        994: () => {},
        120: () => {},
        219: () => {},
        758: () => {},
      },
      t = {}
    function n(r) {
      if (t[r]) return t[r].exports
      var o = (t[r] = { exports: {} })
      return e[r].call(o.exports, o, o.exports, n), o.exports
    }
    return (
      (n.g = (function() {
        if ('object' == typeof globalThis) return globalThis
        try {
          return this || new Function('return this')()
        } catch (e) {
          if ('object' == typeof window) return window
        }
      })()),
      n(10)
    )
  })()
})
