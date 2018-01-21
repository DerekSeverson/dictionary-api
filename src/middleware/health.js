'use strict';

const route = require('koa-route');

exports = module.exports = function health() {
  return route.get('/health', ctx => ctx.body = 'running');
};
