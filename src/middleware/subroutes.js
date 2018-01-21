'use strict';

const Router = require('koa-router');

exports = module.exports = function subroutes(callback) {
  let router = new Router();
  callback(router);
  return router.routes();
};
