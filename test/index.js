'use strict';

const fs = require('fs'),
      path = require('path');

const assert = require('power-assert'),
      spectron = require('spectron'),
      url = require('url');

const Application = spectron.Application;

const electronPrebuiltPath = require.resolve('electron-prebuilt'),
      electronPrebuiltFile = require.resolve('electron-prebuilt/path.txt');

const electronPrebuiltDir = path.dirname(electronPrebuiltPath),
      electronPrebuiltBin = fs.readFileSync(electronPrebuiltFile, 'utf8');

const binaryPath = path.join(electronPrebuiltDir, electronPrebuiltBin);

describe('ipc-promise', function() {
  beforeEach(function() {
    this.app = new Application({
      path: binaryPath,
    });

    return this.app.start();
  });

  afterEach(function() {
    if (this.app && this.app.isRunning()) {
      return this.app.stop();
    }
  });

  it('catch sent message, and return value by Promise', function() {
    const ipcPromisePath = path.join(__dirname, '..', 'ipc-promise.js');

    return this.app.client.executeAsync(function(ipcPromisePath, done) {
      const electron = require('electron');

      const ipcMainPromise = electron.remote.require(ipcPromisePath),
            ipcRendererPromise = require(ipcPromisePath);

      ipcMainPromise.on('to-main-from-renderer', function(params) {
        //return new Promise(function(resolve, reject) {
        //  if (params.value === 'main') {
        //    resolve({ value: 42 });
        //  } else {
        //    reject(new Error());
        //  }
        //});
      });

      ipcRendererPromise.send('to-main-from-renderer', {
        value: 'main'
      }).then(done);
    }, ipcPromisePath).then(function(result) {
      console.log(result.value);
      return (result.value.value === 42) ? Promise.resolve() : Promise.reject();
    });
  });
});
