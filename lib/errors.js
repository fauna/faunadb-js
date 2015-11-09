/** Base class for all FaunaDB errors. */
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var FaunaError = (function (_Error) {
  _inherits(FaunaError, _Error);

  function FaunaError(message) {
    _classCallCheck(this, FaunaError);

    _get(Object.getPrototypeOf(FaunaError.prototype), 'constructor', this).call(this, message);
    // Subclassing error doesn't work right until node 4.0.
    // This is a kludge to give it some stack.
    if (!('stack' in this)) {
      this.message = message;
      this.stack = new Error(this.message).stack;
    }
  }

  /** Thrown when a query is malformed */
  return FaunaError;
})(Error);

exports.FaunaError = FaunaError;

var InvalidQuery = (function (_FaunaError) {
  _inherits(InvalidQuery, _FaunaError);

  function InvalidQuery() {
    _classCallCheck(this, InvalidQuery);

    _get(Object.getPrototypeOf(InvalidQuery.prototype), 'constructor', this).apply(this, arguments);
  }

  /** Thrown when a value can not be accepted. */
  return InvalidQuery;
})(FaunaError);

exports.InvalidQuery = InvalidQuery;

var InvalidValue = (function (_FaunaError2) {
  _inherits(InvalidValue, _FaunaError2);

  function InvalidValue() {
    _classCallCheck(this, InvalidValue);

    _get(Object.getPrototypeOf(InvalidValue.prototype), 'constructor', this).apply(this, arguments);
  }

  /** Thrown when the FaunaDB server responds with an error. */
  return InvalidValue;
})(FaunaError);

exports.InvalidValue = InvalidValue;

var FaunaHTTPError = (function (_FaunaError3) {
  _inherits(FaunaHTTPError, _FaunaError3);

  function FaunaHTTPError(response_object) {
    _classCallCheck(this, FaunaHTTPError);

    var errors = 'error' in response_object ? [response_object['error']] : response_object['errors'];
    var reason = response_object.reason;
    _get(Object.getPrototypeOf(FaunaHTTPError.prototype), 'constructor', this).call(this, reason || errors[0].code || errors[0]);
    this.errors = errors;
    this.reason = reason;
    this.parameters = response_object.parameters;
  }

  /** HTTP 400 error. */
  return FaunaHTTPError;
})(FaunaError);

exports.FaunaHTTPError = FaunaHTTPError;

var BadRequest = (function (_FaunaHTTPError) {
  _inherits(BadRequest, _FaunaHTTPError);

  function BadRequest() {
    _classCallCheck(this, BadRequest);

    _get(Object.getPrototypeOf(BadRequest.prototype), 'constructor', this).apply(this, arguments);
  }

  /** HTTP 401 error. */
  return BadRequest;
})(FaunaHTTPError);

exports.BadRequest = BadRequest;

var Unauthorized = (function (_FaunaHTTPError2) {
  _inherits(Unauthorized, _FaunaHTTPError2);

  function Unauthorized() {
    _classCallCheck(this, Unauthorized);

    _get(Object.getPrototypeOf(Unauthorized.prototype), 'constructor', this).apply(this, arguments);
  }

  /** HTTP 403 error. */
  return Unauthorized;
})(FaunaHTTPError);

exports.Unauthorized = Unauthorized;

var PermissionDenied = (function (_FaunaHTTPError3) {
  _inherits(PermissionDenied, _FaunaHTTPError3);

  function PermissionDenied() {
    _classCallCheck(this, PermissionDenied);

    _get(Object.getPrototypeOf(PermissionDenied.prototype), 'constructor', this).apply(this, arguments);
  }

  /** HTTP 404 error. */
  return PermissionDenied;
})(FaunaHTTPError);

exports.PermissionDenied = PermissionDenied;

var NotFound = (function (_FaunaHTTPError4) {
  _inherits(NotFound, _FaunaHTTPError4);

  function NotFound() {
    _classCallCheck(this, NotFound);

    _get(Object.getPrototypeOf(NotFound.prototype), 'constructor', this).apply(this, arguments);
  }

  /** HTTP 405 error. */
  return NotFound;
})(FaunaHTTPError);

exports.NotFound = NotFound;

var MethodNotAllowed = (function (_FaunaHTTPError5) {
  _inherits(MethodNotAllowed, _FaunaHTTPError5);

  function MethodNotAllowed() {
    _classCallCheck(this, MethodNotAllowed);

    _get(Object.getPrototypeOf(MethodNotAllowed.prototype), 'constructor', this).apply(this, arguments);
  }

  /** HTTP 500 error. */
  return MethodNotAllowed;
})(FaunaHTTPError);

exports.MethodNotAllowed = MethodNotAllowed;

var InternalError = (function (_FaunaHTTPError6) {
  _inherits(InternalError, _FaunaHTTPError6);

  function InternalError() {
    _classCallCheck(this, InternalError);

    _get(Object.getPrototypeOf(InternalError.prototype), 'constructor', this).apply(this, arguments);
  }

  /** HTTP 503 error. */
  return InternalError;
})(FaunaHTTPError);

exports.InternalError = InternalError;

var UnavailableError = (function (_FaunaHTTPError7) {
  _inherits(UnavailableError, _FaunaHTTPError7);

  function UnavailableError() {
    _classCallCheck(this, UnavailableError);

    _get(Object.getPrototypeOf(UnavailableError.prototype), 'constructor', this).apply(this, arguments);
  }

  return UnavailableError;
})(FaunaHTTPError);

exports.UnavailableError = UnavailableError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9lcnJvcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUNhLFVBQVU7WUFBVixVQUFVOztBQUNWLFdBREEsVUFBVSxDQUNULE9BQU8sRUFBRTswQkFEVixVQUFVOztBQUVuQiwrQkFGUyxVQUFVLDZDQUViLE9BQU8sRUFBQzs7O0FBR2QsUUFBSSxFQUFFLE9BQU8sSUFBSSxJQUFJLENBQUEsQUFBQyxFQUFFO0FBQ3RCLFVBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO0FBQ3RCLFVBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQTtLQUMzQztHQUNGOzs7U0FUVSxVQUFVO0dBQVMsS0FBSzs7OztJQWF4QixZQUFZO1lBQVosWUFBWTs7V0FBWixZQUFZOzBCQUFaLFlBQVk7OytCQUFaLFlBQVk7Ozs7U0FBWixZQUFZO0dBQVMsVUFBVTs7OztJQUcvQixZQUFZO1lBQVosWUFBWTs7V0FBWixZQUFZOzBCQUFaLFlBQVk7OytCQUFaLFlBQVk7Ozs7U0FBWixZQUFZO0dBQVMsVUFBVTs7OztJQUcvQixjQUFjO1lBQWQsY0FBYzs7QUFDZCxXQURBLGNBQWMsQ0FDYixlQUFlLEVBQUU7MEJBRGxCLGNBQWM7O0FBRXZCLFFBQU0sTUFBTSxHQUFHLE9BQU8sSUFBSSxlQUFlLEdBQ3ZDLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQzFCLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUMzQixRQUFNLE1BQU0sR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFBO0FBQ3JDLCtCQU5TLGNBQWMsNkNBTWpCLE1BQU0sSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBQztBQUM1QyxRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtBQUNwQixRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtBQUNwQixRQUFJLENBQUMsVUFBVSxHQUFHLGVBQWUsQ0FBQyxVQUFVLENBQUE7R0FDN0M7OztTQVZVLGNBQWM7R0FBUyxVQUFVOzs7O0lBY2pDLFVBQVU7WUFBVixVQUFVOztXQUFWLFVBQVU7MEJBQVYsVUFBVTs7K0JBQVYsVUFBVTs7OztTQUFWLFVBQVU7R0FBUyxjQUFjOzs7O0lBR2pDLFlBQVk7WUFBWixZQUFZOztXQUFaLFlBQVk7MEJBQVosWUFBWTs7K0JBQVosWUFBWTs7OztTQUFaLFlBQVk7R0FBUyxjQUFjOzs7O0lBR25DLGdCQUFnQjtZQUFoQixnQkFBZ0I7O1dBQWhCLGdCQUFnQjswQkFBaEIsZ0JBQWdCOzsrQkFBaEIsZ0JBQWdCOzs7O1NBQWhCLGdCQUFnQjtHQUFTLGNBQWM7Ozs7SUFHdkMsUUFBUTtZQUFSLFFBQVE7O1dBQVIsUUFBUTswQkFBUixRQUFROzsrQkFBUixRQUFROzs7O1NBQVIsUUFBUTtHQUFTLGNBQWM7Ozs7SUFHL0IsZ0JBQWdCO1lBQWhCLGdCQUFnQjs7V0FBaEIsZ0JBQWdCOzBCQUFoQixnQkFBZ0I7OytCQUFoQixnQkFBZ0I7Ozs7U0FBaEIsZ0JBQWdCO0dBQVMsY0FBYzs7OztJQUd2QyxhQUFhO1lBQWIsYUFBYTs7V0FBYixhQUFhOzBCQUFiLGFBQWE7OytCQUFiLGFBQWE7Ozs7U0FBYixhQUFhO0dBQVMsY0FBYzs7OztJQUdwQyxnQkFBZ0I7WUFBaEIsZ0JBQWdCOztXQUFoQixnQkFBZ0I7MEJBQWhCLGdCQUFnQjs7K0JBQWhCLGdCQUFnQjs7O1NBQWhCLGdCQUFnQjtHQUFTLGNBQWMiLCJmaWxlIjoiZXJyb3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEJhc2UgY2xhc3MgZm9yIGFsbCBGYXVuYURCIGVycm9ycy4gKi9cbmV4cG9ydCBjbGFzcyBGYXVuYUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlKSB7XG4gICAgc3VwZXIobWVzc2FnZSlcbiAgICAvLyBTdWJjbGFzc2luZyBlcnJvciBkb2Vzbid0IHdvcmsgcmlnaHQgdW50aWwgbm9kZSA0LjAuXG4gICAgLy8gVGhpcyBpcyBhIGtsdWRnZSB0byBnaXZlIGl0IHNvbWUgc3RhY2suXG4gICAgaWYgKCEoJ3N0YWNrJyBpbiB0aGlzKSkge1xuICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZVxuICAgICAgdGhpcy5zdGFjayA9IG5ldyBFcnJvcih0aGlzLm1lc3NhZ2UpLnN0YWNrXG4gICAgfVxuICB9XG59XG5cbi8qKiBUaHJvd24gd2hlbiBhIHF1ZXJ5IGlzIG1hbGZvcm1lZCAqL1xuZXhwb3J0IGNsYXNzIEludmFsaWRRdWVyeSBleHRlbmRzIEZhdW5hRXJyb3Ige31cblxuLyoqIFRocm93biB3aGVuIGEgdmFsdWUgY2FuIG5vdCBiZSBhY2NlcHRlZC4gKi9cbmV4cG9ydCBjbGFzcyBJbnZhbGlkVmFsdWUgZXh0ZW5kcyBGYXVuYUVycm9yIHt9XG5cbi8qKiBUaHJvd24gd2hlbiB0aGUgRmF1bmFEQiBzZXJ2ZXIgcmVzcG9uZHMgd2l0aCBhbiBlcnJvci4gKi9cbmV4cG9ydCBjbGFzcyBGYXVuYUhUVFBFcnJvciBleHRlbmRzIEZhdW5hRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihyZXNwb25zZV9vYmplY3QpIHtcbiAgICBjb25zdCBlcnJvcnMgPSAnZXJyb3InIGluIHJlc3BvbnNlX29iamVjdCA/XG4gICAgICBbcmVzcG9uc2Vfb2JqZWN0WydlcnJvciddXSA6XG4gICAgICByZXNwb25zZV9vYmplY3RbJ2Vycm9ycyddXG4gICAgY29uc3QgcmVhc29uID0gcmVzcG9uc2Vfb2JqZWN0LnJlYXNvblxuICAgIHN1cGVyKHJlYXNvbiB8fCBlcnJvcnNbMF0uY29kZSB8fCBlcnJvcnNbMF0pXG4gICAgdGhpcy5lcnJvcnMgPSBlcnJvcnNcbiAgICB0aGlzLnJlYXNvbiA9IHJlYXNvblxuICAgIHRoaXMucGFyYW1ldGVycyA9IHJlc3BvbnNlX29iamVjdC5wYXJhbWV0ZXJzXG4gIH1cbn1cblxuLyoqIEhUVFAgNDAwIGVycm9yLiAqL1xuZXhwb3J0IGNsYXNzIEJhZFJlcXVlc3QgZXh0ZW5kcyBGYXVuYUhUVFBFcnJvciB7fVxuXG4vKiogSFRUUCA0MDEgZXJyb3IuICovXG5leHBvcnQgY2xhc3MgVW5hdXRob3JpemVkIGV4dGVuZHMgRmF1bmFIVFRQRXJyb3Ige31cblxuLyoqIEhUVFAgNDAzIGVycm9yLiAqL1xuZXhwb3J0IGNsYXNzIFBlcm1pc3Npb25EZW5pZWQgZXh0ZW5kcyBGYXVuYUhUVFBFcnJvciB7fVxuXG4vKiogSFRUUCA0MDQgZXJyb3IuICovXG5leHBvcnQgY2xhc3MgTm90Rm91bmQgZXh0ZW5kcyBGYXVuYUhUVFBFcnJvciB7fVxuXG4vKiogSFRUUCA0MDUgZXJyb3IuICovXG5leHBvcnQgY2xhc3MgTWV0aG9kTm90QWxsb3dlZCBleHRlbmRzIEZhdW5hSFRUUEVycm9yIHt9XG5cbi8qKiBIVFRQIDUwMCBlcnJvci4gKi9cbmV4cG9ydCBjbGFzcyBJbnRlcm5hbEVycm9yIGV4dGVuZHMgRmF1bmFIVFRQRXJyb3Ige31cblxuLyoqIEhUVFAgNTAzIGVycm9yLiAqL1xuZXhwb3J0IGNsYXNzIFVuYXZhaWxhYmxlRXJyb3IgZXh0ZW5kcyBGYXVuYUhUVFBFcnJvciB7fVxuIl19