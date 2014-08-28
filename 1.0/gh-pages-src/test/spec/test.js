/* global describe, it */
var assert = require('chai').assert;

(function () {
    'use strict';

    describe('Give it some context', function () {
        describe('maybe a bit more context here', function () {
            it('should run here few assertions', function () {
              assert.ok(true);
            });
          });
      });
  })();
