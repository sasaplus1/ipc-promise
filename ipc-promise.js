/*!
 * @license ipc-promise Copyright(c) 2015 sasa+1
 * https://github.com/sasaplus1/ipc-promise
 * Released under the MIT license.
 */

/**
 * export to AMD/CommonJS/global.
 *
 * @param {Object} root root object.
 * @param {Function} factory factory method.
 */
(function(root, factory){
  'use strict';

  if (typeof define === 'function' && define.amd) {
    define(['ipc', 'events'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('ipc'), require('events'));
  } else {
    root.ipcPromise = factory(global.require('ipc'), global.require('events'));
  }
}((this || 0).self || global, function(ipc, events){
  'use strict';

  // constants
  var COMMON_EVENT_NAME = 'ipc-promise-common-event',
      SUCCESS_EVENT_SUFFIX = '-success',
      FAILURE_EVENT_SUFFIX = '-failure',
      COMMON_SUCCESS_EVENT_NAME = COMMON_EVENT_NAME + SUCCESS_EVENT_SUFFIX,
      COMMON_FAILURE_EVENT_NAME = COMMON_EVENT_NAME + FAILURE_EVENT_SUFFIX;

  // common event emitter
  var cee = new events.EventEmitter();

  /**
   * common event handler for ipc.
   *
   * @private
   * @param {Event} event event object.
   * @param {Object} arg argument object.
   */
  function commonEventHandler(event, arg) {
    // send from renderer process always.

    // add listener to common event emitter for main process.
    cee.on(arg.event + SUCCESS_EVENT_SUFFIX, function(result) {
      // send success to ipc for renderer process.
      event.sender.send(COMMON_SUCCESS_EVENT_NAME, {
        data: result,
        event: arg.event,
        id: arg.id
      });
    });
    cee.on(arg.event + FAILURE_EVENT_SUFFIX, function(result) {
      // send failure to ipc for renderer process.
      event.sender.send(COMMON_FAILURE_EVENT_NAME, {
        data: result,
        event: arg.event,
        id: arg.id
      });
    });

    // emit to common event emitter for main process.
    cee.emit(arg.event, arg.data);
  }

  /**
   * trigger event.
   *
   * @param {String} event event name of common event emitter on main process.
   * @param {*} data data for send.
   * @return {Promise} promise.
   */
  function send(event, data) {
    // call from renderer process always.

    return new Promise(function(resolve, reject) {
      var id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
          onSuccess, onFailure;

      // add listener to ipc for renderer process.
      ipc.on(COMMON_SUCCESS_EVENT_NAME, onSuccess = function(params) {
        if (params.id !== id || params.event !== event) {
          return;
        }

        // remove this listener.
        ipc.removeListener(COMMON_SUCCESS_EVENT_NAME, onSuccess);
        ipc.removeListener(COMMON_FAILURE_EVENT_NAME, onFailure);

        resolve(params.data);
      });
      ipc.on(COMMON_FAILURE_EVENT_NAME, onFailure = function(params) {
        if (params.id !== id || params.event !== event) {
          return;
        }

        // remove this listener.
        ipc.removeListener(COMMON_SUCCESS_EVENT_NAME, onSuccess);
        ipc.removeListener(COMMON_FAILURE_EVENT_NAME, onFailure);

        reject(params.data);
      });

      // send to ipc for main process.
      ipc.send(COMMON_EVENT_NAME, {
        data: data,
        event: event,
        id: id
      });
    });
  }

  /**
   * listen event.
   *
   * @param {String} event event name.
   * @param {Function} listener listener function.
   */
  function on(event, listener) {
    // call from main process always.

    // add listener to common event emitter for main process.
    cee.on(event, function(data) {
      listener(data)
        .then(function(result) {
          cee.emit(event + SUCCESS_EVENT_SUFFIX, result);
        })
        .catch(function(result) {
          cee.emit(event + FAILURE_EVENT_SUFFIX, result);
        });
    });
  }

  // main process
  if (typeof window === 'undefined') {
    // add common event handler for ipc of main process.
    ipc.on(COMMON_EVENT_NAME, commonEventHandler);
  }

  return {
    on: on,
    send: send
  };
}));
