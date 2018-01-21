'use strict';

const debug = require('debug')('common/middleware:request');
const onFinished = require('on-finished');
const uuid = require('uuid/v4');
const isStream = require('is-stream');
const isBuffer = require('is-buffer');

exports = module.exports = {};

exports.id = function makeRequestIdMiddlware() {

  return function requestIdMiddleware(ctx, next) {

    let req_id = uuid();
    ctx.req_id = req_id;
    ctx.request.id = req_id;
    ctx.response.set('X-Request-Id', req_id);

    debug('ctx.req_id', req_id);

    return next();
  };
};

exports.log = function makeLogRequestMiddleware(opts = {}) {

  const MESSAGE = opts.message || 'Request Middleware';

  const determineLogLevel = status => {
    if (status === 404) return 'trace';
    if (status >= 500) return 'error';
    if (status >= 400) return 'warn';
    return 'info';
  };

  return function logRequestMiddleware(ctx, next) {
    let err;

    if (!isBunyan(ctx.log)) {
      debug('ctx.log is not bunyan, throwing error');
      throw new Error('ctx.log not bunyan instance');
    }

    if (ctx.req_id) {
      debug('ctx.log.child({ req_id })');
      ctx.log = ctx.log.child({ req_id: ctx.req_id });
    }

    return next()
      .catch(error => {
        debug('caught error');
        err = error;
      })
      .then(function logRequestMiddlewareSetup() {

        debug('registering callback with response on-finished');

        onFinished(ctx.res, function onFinishResponseLogRequest() {

          debug('response finished - now logging to bunyan');

          const level = determineLogLevel(ctx.status);
          const subject = {};
          subject.req = ctx.req;
          subject.res = ctx.res;
          if (err) subject.err = err;
          if (hasLoggableBody(ctx.request)) subject.req_body = ctx.request.body;
          if (hasLoggableBody(ctx.response)) subject.res_body = ctx.response.body;

          ctx.log[level](subject, MESSAGE);
        });

        if (err) {
          debug('rethrowing error');
          throw err;
        }
      });
  };
};

// ===

function hasLoggableBody(res_or_req) {
  return (
    res_or_req &&
    res_or_req.body &&
    (!isStream(res_or_req.body)) &&
    (!isBuffer(res_or_req.body)) &&
    res_or_req.is('text/*', 'json') &&
    (res_or_req.length <= 4000) /* 4 KB */
  );
}

function isBunyan(o) {
  return (o &&
    (typeof o.trace === 'function') &&
    (typeof o.debug === 'function') &&
    (typeof o.info === 'function') &&
    (typeof o.warn === 'function') &&
    (typeof o.error === 'function') &&
    (typeof o.child === 'function')
  );
}
