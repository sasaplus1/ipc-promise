'use strict';

const fs = require('fs'),
      path = require('path');

const assert = require('power-assert'),
      spectron = require('spectron'),
      url = require('url');

const Application = spectron.Application;

var electronPath = fs.readFileSync(require.resolve('electron-prebuilt/path.txt'), {
  encoding: 'utf8',
});

var p = path.join(
  path.dirname(require.resolve('electron-prebuilt')), electronPath
);

describe('ipc-promise', function() {
  let app = null;

  beforeEach(function() {
    app = new Application({
      path: p,
      preload: '(process.env.NODE_ENV === "test") && (window.electronRequire = require);',
      args: [
        path.join(__dirname, 'main.js'),
      ],
      //requireName: 'electronRequire'
    });

    return app.start();
  });

  afterEach(function() {
    if (app && app.isRunning()) {
      return app.stop().then(function() {
        app = null;
      });
    }
  });

  it('catch sent message, and return value by Promise', function() {
    return new Promise(function(resolve, reject) {

      app.electron.on('quit', function(event, exitCode) {
        (exitCode === 0) ? resolve() : reject();
      });

      //const ipcPromise = app.electron.remote.require(
      //  path.join(__dirname, '..', 'ipc-promise.js')
      //);

      //console.log(path.join(__dirname, '..', 'ipc-promise.js'));
      //console.log(ipcPromise);
      //console.log(require('util').inspect(ipcPromise, {depth: null}));
      //console.log(Object.prototype.toString.call(ipcPromise));
      //console.log(ipcPromise.on);
      //console.log(ipcPromise.send);
      //console.log(ipcPromise.on.toString());

      //ipcPromise.on('to-main-from-renderer', function(params) {
      //  return new Promise(function(resolve, reject) {
      //    if (params.value === 'main') {
      //      resolve({ id: 42 });
      //    } else {
      //      reject(new Error('to-main-from-renderer'));
      //    }
      //  });
      //});

      //ipcPromise.on('to-main-from-renderer-success', function({ result }) {
      //  resolve(result.id === 42);
      //});
      //ipcPromise.on('to-main-from-renderer-failure', function({ err }) {
      //  reject(err);
      //});

      //console.log(app);

      //console.log(app.electron.ipcMain);
      //console.log(app.electron.ipcRenderer);

      ////console.log(app.electron);
      //console.log(app.electron.remote.require);
      //console.log(app.electron.remote.require(
      //  __dirname + '/../ipc-promise.js'
      //));

      //app.on('before-quit', console.log.bind(console));
      //app.on('will-quit', console.log.bind(console));
      //app.on('window-all-closed', console.log.bind(console));

      // args経由でmain.jsを読み込ませるとconsole.logに出る
      // 読み込ませないと出ない
      // 意味が分からない
      //app.electron.remote.require(path.join(__dirname, '..', 'ipc-promise.js'))
      //  .then(function(ipcPromise) {
      //    console.log(ipcPromise);
      //    console.log(ipcPromise.on);
      //    console.log(ipcPromise.send);
      //    console.log(typeof ipcPromise.on);
      //    console.log(typeof ipcPromise.send);
      //    console.log(JSON.stringify(ipcPromise));
      //    ipcPromise.on('to-main-from-renderer', function(params) {
      //      return new Promise(function(resolve, reject) {
      //        if (params.value === 'main') {
      //          resolve({ id: 42 });
      //        } else {
      //          reject(new Error('to-main-from-renderer'));
      //        }
      //      });
      //    });
      //    console.log(ipcPromise);
      //ipcPromise.on('to-main-from-renderer-success', function({ result }) {
      //  resolve(result.id === 42);
      //});
      //ipcPromise.on('to-main-from-renderer-failure', function({ err }) {
      //  reject(err);
      //});
      //  })
      //  .catch(function(err) {
      //    console.error(err);
      //  });
      ////console.log(app.electron.remote);
      ////console.log(app.electron.remote.require);
      ////console.log(app.electron.remote.require('../'));

      //const file = url.format({
      //  pathname: path.join(__dirname, 'index.html'),
      //  protocol: 'file',
      //  slashes: true,
      //});

      //app.browserWindow.loadURL(file);




    });
  });
});
