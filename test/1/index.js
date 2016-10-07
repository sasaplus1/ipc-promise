'use strict';

// NOTE: return test title when required by mocha
if (typeof require('electron') === 'string') {
  return (module.exports = 'can pass Promise.resolve to renderer process');
}

const path = require('path'),
      url = require('url');

const electron = require('electron'),
      app = electron.app,
      BrowserWindow = electron.BrowserWindow;

const ipcPromise = require('../../ipc-promise');

let mainWindow;

ipcPromise.on('message', function(params) {
  return Promise.resolve();
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
