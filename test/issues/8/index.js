'use strict';

// NOTE: return test title when required by mocha
if (typeof require('electron') === 'string') {
  return (module.exports = 'can choose correct result when multiple calls at once');
}

const path = require('path'),
      url = require('url');

const electron = require('electron'),
      app = electron.app,
      BrowserWindow = electron.BrowserWindow;

const ipcPromise = require('../../../ipc-promise');

let mainWindow;

ipcPromise.on('delay_echo', function(params, event) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(params);
    }, 10);
  });
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({
    show: false,
  });

  mainWindow.on('closed', function() {
    mainWindow = null;
  });

  const index = url.format({
    protocol: 'file',
    slashes: true,
    pathname: path.join(__dirname, 'index.html'),
  });

  mainWindow.loadURL(index);
});
