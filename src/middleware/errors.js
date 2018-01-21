/* eslint callback-return:0 */
'use strict';

const debug = require('debug')('common/middleware:errors');
const XError = require('x.error');
const prettyjson = require('prettyjson');
const { STATUS_CODES } = require('http');

const isHttpStatus = status => (status in STATUS_CODES);
const httpStatusCode = status => STATUS_CODES[status];

exports = module.exports = function makeErrorMiddleware() {

  return async function errorMiddleware(ctx, next) {

    try {

      await next();

      if (ctx.status === 404) {
        XError.throw({
          name: 'NotFound',
          message: 'Endpoint Does Not Exist.',
          status: 404,
        });
      }

    } catch (err) {

      debug('caught error');

      if (err.isJoi) {
        debug('is validation error joi');
        err.status = 400;
      }

      if (err.ajv) {
        debug('is validation error: ajv');
        err.status = 400;
      }

      let isUnknownException = !(
        isHttpStatus(err.status) ||
        (err.xerror && err.code)
      );

      let isHuman = ctx.query.debug === 'human';
      let isDebug = !!ctx.query.debug;

      if (!isDebug && isUnknownException) {
        debug('unknown error');
        ctx.status = 500;
        ctx.body = {
          type: 'error',
          status: 500,
          statusText: httpStatusCode(500),
          name: 'UnknownException',
          message: 'An Unknown Exception Happened.',
        };

      } else {
        debug('known error');
        let serializedError = (function serialize(err, recursed) {
          let ret = {};
          ret.name = err.name;
          ret.message = err.message;
          if (err.xerror && err.code) ret.code = err.code;
          if (err.xerror && err.tags) ret.code = err.tags;
          if (err.xerror && err.errors) ret.errors = err.errors;
          if (isDebug && err.xerror && err.data) ret.data = err.data;
          if (isDebug && err.stack) ret.stack = err.stack;
          if (isDebug && err.xerror && err.cause) ret.cause = serialize(err.cause, recursed - 1);
          return ret;
        }(err, 2));

        let body = {};
        body.type = 'error';
        body.status = isHttpStatus(err.status) ? err.status : 500;
        body.statusText = httpStatusCode(body.status),
        Object.assign(body, serializedError);

        ctx.status = body.status;
        ctx.body = isHuman ? prettyjson.render(body) : body;
      }

      debug('handled error');
    }
  };

};
