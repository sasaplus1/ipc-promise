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
    define(['electron', 'events'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('electron'), require('events'));
  } else {
    root.ipcPromise = factory(global.require('electron'), global.require('events'));
  }
}((this || 0).self || global, function(electron, events){
  'use strict';

  var ipcMain = electron.ipcMain,
      ipcRenderer = electron.ipcRenderer;

  // constants
  var COMMON_EVENT_NAME = 'ipc-promise-common-event',
      SUCCESS_EVENT_SUFFIX = '-success',
      FAILURE_EVENT_SUFFIX = '-failure',
      COMMON_SUCCESS_EVENT_NAME = COMMON_EVENT_NAME + SUCCESS_EVENT_SUFFIX,
      COMMON_FAILURE_EVENT_NAME = COMMON_EVENT_NAME + FAILURE_EVENT_SUFFIX;

  // common event emitter
  var cee = new events.EventEmitter();

  // get temporary event name for success
  function getSuccessEventName(eventName, id) {
    return eventName + id.toString() + SUCCESS_EVENT_SUFFIX;
  }

  // get temporary event name for failure
  function getFailureEventName(eventName, id) {
    return eventName + id.toString() + FAILURE_EVENT_SUFFIX;
  }

  /**
   * common event handler for ipc.
   *
   * @private
   * @param {Event} event event object.
   * @param {Object} arg argument object.
   */
  function commonEventHandler(event, arg) {
    // NOTE: send from renderer process always.
    var successEventName = getSuccessEventName(arg.eventName, arg.id);
    var failureEventName = getFailureEventName(arg.eventName, arg.id);

    var onSuccess = function(result) {
      // send success to ipc for renderer process.
      event.sender.send(COMMON_SUCCESS_EVENT_NAME, {
        data: result,
        eventName: arg.eventName,
        id: arg.id
      });
      cee.removeListener(successEventName, onSuccess);
      cee.removeListener(failureEventName, onFailure);
    };
    var onFailure = function(result) {
      // send failure to ipc for renderer process.
      event.sender.send(COMMON_FAILURE_EVENT_NAME, {
        data: result,
        eventName: arg.eventName,
        id: arg.id
      });
      cee.removeListener(successEventName, onSuccess);
      cee.removeListener(failureEventName, onFailure);
    };

    // add listener to common event emitter for main process.
    cee.on(successEventName, onSuccess);
    cee.on(failureEventName, onFailure);

    // emit to common event emitter for main process.
    cee.emit(arg.eventName, arg.id, arg.data, event);
  }

  /**
   * trigger event.
   *
   * @param {String} eventName event name of common event emitter on main process.
   * @param {*} data data for send.
   * @return {Promise} promise.
   */
  function send(eventName, data) {
    // NOTE: call from renderer process always.

    return new Promise(function(resolve, reject) {
      var id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
      var onSuccess = function(event, params) {
        if (params.id !== id || params.eventName !== eventName) {
          return;
        }

        // remove this listener.
        ipcRenderer.removeListener(COMMON_SUCCESS_EVENT_NAME, onSuccess);
        ipcRenderer.removeListener(COMMON_FAILURE_EVENT_NAME, onFailure);

        resolve(params.data);
      };
      var onFailure = function(event, params) {
        if (params.id !== id || params.eventName !== eventName) {
          return;
        }

        // remove this listener.
        ipcRenderer.removeListener(COMMON_SUCCESS_EVENT_NAME, onSuccess);
        ipcRenderer.removeListener(COMMON_FAILURE_EVENT_NAME, onFailure);

        reject(params.data);
      };

      // add listener to ipc for renderer process.
      ipcRenderer.on(COMMON_SUCCESS_EVENT_NAME, onSuccess);
      ipcRenderer.on(COMMON_FAILURE_EVENT_NAME, onFailure);

      // send to ipc for main process.
      ipcRenderer.send(COMMON_EVENT_NAME, {
        data: data,
        eventName: eventName,
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
    cee.on(event, function(id, data, ipcEvent) {
      listener(data, ipcEvent)
        .then(function(result) {
          cee.emit(getSuccessEventName(event, id), result);
        })
        .catch(function(result) {
          cee.emit(getFailureEventName(event, id), result);
        });
    });
  }

  // main process
  if (typeof window === 'undefined') {
    // add common event handler for ipc of main process.
    ipcMain.on(COMMON_EVENT_NAME, commonEventHandler);
  }

  return {
    on: on,
    send: send
  };
}));
