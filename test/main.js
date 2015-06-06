'use strict';

var app = require('app'),
    BrowserWindow = require('browser-window'),
    ipcPromise = require('../ipc-promise.js');

var mainWindow;

ipcPromise.on('to-main-from-renderer', function(params) {
  return new Promise(function(resolve, reject) {
    if (params.value === 'main') {
      resolve({ id: 42 });
    } else {
      reject(new Error('to-main-from-renderer'));
    }
  });
});

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({
    show: false
  });
  mainWindow.on('closed', function() {
    mainWindow = null;
  });
  mainWindow.loadUrl(`file://${__dirname}/index.html`);
});
