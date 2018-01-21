/* eslint callback-return:0 */
'use strict';

const debug = require('debug')('common/middleware:exceptions');

exports = module.exports = function makeExceptionMiddleware(opts = {}) {

  const MESSAGE = opts.message || 'Middleware Caught Exception';
  const fields = opts.fields || {};
  const SENTRY_FIELD = fields.sentry || 'sentry';
  const BUNYAN_FIELD = fields.log || 'log';

  return async function exceptionMiddleware(ctx, next) {

    try {

      await next();

    } catch (err) {

      if (!err.status || err.status >= 500) {

        const subject = { err };
        const hasSentry = isRaven(ctx[SENTRY_FIELD]);
        const hasBunyan = isBunyan(ctx[BUNYAN_FIELD]);

        if (hasSentry) {
          debug('capture error via sentry');
          subject.raven = ctx[SENTRY_FIELD].captureException(err);
        }

        if (hasBunyan) {
          debug('log error to bunyan');
          ctx.log.fatal(subject, MESSAGE);
        }

        if (!hasBunyan && !hasSentry) {
          debug('neither bunyan or sentry is setup');
          console.error(MESSAGE, subject); // eslint-disable-line no-console
        }
      }

      // Always rethrow for the Error Middleware to catch.
      throw err;

    }

  };
};

// ===

function isRaven(o) {
  return o && (typeof o.captureException === 'function');
}

function isBunyan(o) {
  return o && (typeof o.error === 'function') && (typeof o.child === 'function');
}
