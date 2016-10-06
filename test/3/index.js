'use strict';

// NOTE: return test title when required by mocha
if (typeof require('electron') === 'string') {
  return (module.exports = 'can pass params to main process');
}

const path = require('path'),
      url = require('url');

const { app, BrowserWindow } = require('electron');

const ipcPromise = require('../../ipc-promise');

let mainWindow;

ipcPromise.on('message', function(params, event) {
  if (typeof params === 'object' && typeof event === 'object') {
    return Promise.resolve({
      value: params.value * 2,
    });
  } else {
    return Promise.reject(
      new TypeError('invalid types')
    );
  }
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
