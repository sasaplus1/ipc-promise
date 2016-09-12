(function(){
  'use strict';

  /*global ipcPromise*/

  ipcPromise
    .send('to-main-from-renderer', {
      value: 'main'
    })
    .then(function(result) {
      const electron = require('electron');

      electron.app.exit(0);
    })
    .catch(function(err) {
      const electron = require('electron');

      electron.app.exit(1);
    });
}());
