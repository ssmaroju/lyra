'use strict';

// PromiseLikeObject exposes the .catch and .then methods of a regular Promise,
// with none of the underlying functionality: this is what gets returned from
// the CancellablePromise in the event that the CancellablePromise has, in fact,
// been cancelled. PLO's can be chained ad infinitum but no callbacks will ever
// fire.
function PromiseLikeObject() {}

PromiseLikeObject.prototype.catch = PromiseLikeObject.prototype.then = function() {
  return new PromiseLikeObject();
};

/**
 * Provide a Promise-style interface but expose a .cancel() method on the
 * returned "Promise"-like object that will prevent any registered success
 * callbacks from executing. (Failure callbacks will execute as normal.)
 *
 * @constructor
 * @param {Function} executorFn - A normal Promise executor function,
 * accepting "resolve" and "reject" callback function properties.
 * @returns {CancellablePromise} The CancellablePromise instance
 */
function CancellablePromise(executorFn) {
  this.cancelled = false;
  this.promise = new Promise(executorFn.bind(this));
}

/**
 * Cancel this Promise's callbacks
 * @returns {void}
 */
CancellablePromise.prototype.cancel = function() {
  this.cancelled = true;
};

/**
 * Chain a success (and optionally a failure) callback onto this promise;
 * these success callbacks will not execute if this promise is cancelled.
 *
 * @param {Function} onFulfilled - A promise success callback
 * @param {Function} onRejected - A promise rejection callback
 * @returns {Object} A successful Promise, or a cancelled Promise-like object
 */
CancellablePromise.prototype.then = function(onFulfilled, onRejected) {
  if (this.cancelled) {
    return new PromiseLikeObject();
  }
  var that = this;
  return this.promise.then(function(result) {
    if (!that.cancelled) {
      return onFulfilled(result);
    }
    return new PromiseLikeObject();
  }).catch(onRejected);
};

/**
 * Chain a failure callback onto this promise
 *
 * @param {Function} onRejected - A promise rejection callback
 * @returns {Promise} The actual promise, with this catch chained onto it
 */
CancellablePromise.prototype.catch = function(onRejected) {
  return this.promise.catch(onRejected);
};

module.exports = CancellablePromise;
