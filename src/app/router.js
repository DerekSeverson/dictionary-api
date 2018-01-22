'use strict';

const Router = require('koa-router');
const m = require('middleware');
const routes = require('api');

exports = module.exports = function () {

  let router = Router();

  router
    .get('/', m.echo(null))
    .get('/ping', m.echo('pong'))
    .get('/search', routes.search)
    .get('/definition/:word', routes.definition);

  return router.routes();
};
