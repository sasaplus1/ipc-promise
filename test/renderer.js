(function(){
  'use strict';

  /*global ipcPromise*/

  ipcPromise
    .send('to-main-from-renderer', {
      value: 'main'
    })
    .then(function(result) {
      console.log(JSON.stringify(result));
      console.log('exit: 0');
      require('remote').process.exit(0);
    })
    .catch(function(err) {
      console.error(JSON.stringify(err));
      console.error('exit: 1');
      require('remote').process.exit(1);
    });
}());
