/* eslint no-console:0 no-process-exit:0 */
'use strict';

const Raven = require('raven'); // Sentry Library
const once = require('lodash/once');
const yn = require('yn');

process.on('uncaughtException', err => {
  console.error('Uncaught Exception', err);
});

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection', reason);
});

exports = module.exports = once(function (opts = {}) {

  const env = process.env;
  const config = {};

  config.captureUnhandledRejections = true;
  config.environment = opts.environment || env.SENTRY_ENVIRONMENT || env.NODE_ENV;
  config.exitOnUnhandledException = (yn(env.EXIT_ON_UNHANDLED_EXCEPTION) !== false);

  if ('logger' in opts) config.logger = opts.logger;
  if ('release' in opts) config.release = opts.release;
  if ('tags' in opts) config.tags = opts.tags;
  if ('extra' in opts) config.extra = opts.extra;

  const dsn = ('dsn' in opts) ? opts.dsn : env.SENTRY_DSN;

  Raven.config(dsn, config).install(function () {
    if (config.exitOnUnhandledException) {
      console.error('Unhandled Exception or Rejection', new Date(), '(Shutting Down)');
      process.exit(1);
    }
  });

  if (yn(env.SENTRY_CONSOLE_ALERTS_OFF) === true) {
    Raven.disableConsoleAlerts();
  }

  return Raven;
});

exports.Raven = Raven;
exports.captureException = (...args) => Raven.captureException(...args);
