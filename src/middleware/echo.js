'use strict';

exports = module.exports = function (message) {
  return function echo(ctx) {
    ctx.body = message;
  };
};
