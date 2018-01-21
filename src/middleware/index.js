'use strict';

const middleware = exports = module.exports = {};

// 3rd Party Middleware

middleware.bodyparser = require('koa-bodyparser');
middleware.compose = require('koa-compose');
middleware.cors = require('koa-cors');

// Local Middleware

Object.assign(middleware, require('require-dir')());
