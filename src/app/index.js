'use strict';

// Create Koa

const Koa = require('koa');
const app = new Koa();

// Bootstrap the Services

app.context.config = require('app/config');
app.context.package = require('app/package');
app.context.sentry = require('app/sentry');
app.context.log = require('app/log');

// Middleware

const router = require('app/router');
const middleware = require('middleware');

// CORS Settings

app.use(middleware.cors({
  origin: true,
  methods: 'GET,POST,PUT,DELETE',
}));

// Error Handler Middleware

app.use(middleware.errors());
app.use(middleware.exceptions());

// Healthcheck Middlware

app.use(middleware.health());

// Logging Middleware Setup

app.use(middleware.request.id());
app.use(middleware.request.log());

// POST body Parsing

app.use(middleware.bodyparser());

// API Router Middleware Setup

app.use(router());

// Export Koa App

exports = module.exports = app;
