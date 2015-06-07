# ipc-promise

[![Build Status](https://travis-ci.org/sasaplus1/ipc-promise.svg)](https://travis-ci.org/sasaplus1/ipc-promise)
[![Dependency Status](https://gemnasium.com/sasaplus1/ipc-promise.svg)](https://gemnasium.com/sasaplus1/ipc-promise)
[![NPM version](https://badge.fury.io/js/ipc-promise.svg)](http://badge.fury.io/js/ipc-promise)
[![Bower version](https://badge.fury.io/bo/ipc-promise.svg)](http://badge.fury.io/bo/ipc-promise)

ipc use as Promises

## Installation

### npm

```sh
$ npm install ipc-promise
```

### bower

```sh
$ bower install ipc-promise
```

## Usage

### main process

```js
var ipcPromise = require('ipc-promise');

ipcPromise.on('twice', function(params) {
  return Promise.resolve(params.value * 2);
});

var app = require('app'),
    BrowserWindow = require('browser-window'),
    mainWindow;

app.on('ready', function() {
  mainWindow = new BrowserWindow({});
  mainWindow.loadUrl('file://' + __dirname + '/index.html');
});
```

### renderer process

```html
<!DOCTYPE html>
<script src="ipc-promise.min.js"></script>
<script>
  ipcPromise
    .send('twice', {
      value: 1
    })
    .then(function(result) {
      console.log(result);  // => "2"
    });
</script>
```

## Functions

### on(event, listener)

- `event`
  - `String` - event name
- `listener`
  - `Function(*): Promise` - listener function

listen event.

### send(event, data)

- `event`
  - `String` - event name
- `data`
  - `*` - data for send
- `return`
  - `Promise` - Promises

trigger event.

## Test

```sh
$ npm install
$ npm test
```

## License

The MIT license. Please see LICENSE file.
