'use strict';

const assert = require('assert'),
      { spawnSync } = require('child_process');

const electron = require('electron'),
      glob = require('glob');

describe('ipc-promise', function() {

  glob.sync(`${__dirname}/*/**/*.js`).forEach(function(script) {
    it(require(script), function() {
      assert(spawnSync(electron, [script], {
        stdio: [
          process.stdin,
          process.stdout,
          process.stderr,
        ]
      }).status === 0);
    });
  });

});
