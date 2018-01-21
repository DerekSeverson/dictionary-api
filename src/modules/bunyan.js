/* istanbul ignore next */
'use strict';

const bunyan = require('bunyan');
const cloudwatch = require('bunyan-cloudwatch');
const moment = require('moment');
const yn = require('yn');

const fallback = (...args) => args.find(v => v !== '' && v != null);

let external = exports = module.exports = function (opts = {}) {

  const env = process.env;
  const config = {};

  config.name                     = opts.name || opts.NAME || opts.APP_NAME || env.APP_NAME || 'app';
  config.serializers              = opts.serializers || Object.assign({}, external.defaults.serializers);
  config.level                    = opts.level || opts.BUNYAN_LOG_LEVEL || env.BUNYAN_LOG_LEVEL || 'info';

  config.BUNYAN_OFF               = fallback(yn(opts.BUNYAN_OFF), yn(env.BUNYAN_OFF));
  config.BUNYAN_STDOUT_OFF        = fallback(yn(opts.BUNYAN_STDOUT_OFF), yn(env.BUNYAN_STDOUT_OFF));
  config.BUNYAN_CLOUDWATCH_OFF    = fallback(yn(opts.BUNYAN_CLOUDWATCH_OFF), yn(env.BUNYAN_CLOUDWATCH_OFF));

  config.BUNYAN_OFF               = config.BUNYAN_OFF || (config.BUNYAN_STDOUT_OFF && config.BUNYAN_CLOUDWATCH_OFF);

  config.BUNYAN_CLOUDWATCH_GROUP  = opts.BUNYAN_CLOUDWATCH_GROUP || env.BUNYAN_CLOUDWATCH_GROUP;
  
  config.BUNYAN_CLOUDWATCH_REGION = (
    opts.BUNYAN_CLOUDWATCH_REGION ||
    env.BUNYAN_CLOUDWATCH_REGION ||
    opts.AWS_REGION ||
    env.AWS_REGION ||
    env.AWS_DEFAULT_REGION
  );

  config.BUNYAN_CLOUDWATCH_STREAM = (
    opts.BUNYAN_CLOUDWATCH_STREAM ||
    env.BUNYAN_CLOUDWATCH_STREAM ||
    moment().format(
      opts.BUNYAN_CLOUDWATCH_STREAM_FORMAT ||
      env.BUNYAN_CLOUDWATCH_STREAM_FORMAT ||
      `YYYY-MM-DD HH:mm:ss.SSS - [${config.name}]`
    )
  );

  return bunyan.createLogger(configure(config));
};

external.loggable = new BunyanLoggabilityHelper();
external.defaults = {};
external.defaults.serializers = {
  req: bunyan.stdSerializers.req,
  res: bunyan.stdSerializers.res,
  err: xerrorSerializer,
};

// -------------------
// Helper Functions

function configure(config) {

  const result = {
    name: config.name,
    serializers: config.serializers,
  };

  if (config.BUNYAN_OFF) {
    return Object.assign(result, {
      level: bunyan.FATAL + 1,
    });
  }

  result.streams = [];

  if (!config.BUNYAN_STDOUT_OFF) {

    result.streams.push({
      level: config.level,
      stream: process.stdout,
    });

    result.streams.push({
      level: 'error',
      stream: process.stderr,
    });
  }

  if (config.BUNYAN_CLOUDWATCH_OFF) {
    return result;
  }

  result.streams.push({
    level: config.level,
    type: 'raw',
    stream: cloudwatch({
      logGroupName: config.BUNYAN_CLOUDWATCH_GROUP,
      logStreamName: config.BUNYAN_CLOUDWATCH_STREAM,
      cloudWatchLogsOptions: {
        region: config.BUNYAN_CLOUDWATCH_REGION,
      },
    }),
  });

  return result;
}

// ----------------------------
// Bunyan Loggability Helper

function BunyanLoggabilityHelper() {

  const TO_JSON_FAILED_MESSAGE = '<SerializationFailed>';
  const makeLoggable = func => subject => Object.defineProperty(subject, 'toJSON', {
    value: function safeToJson(...args) {
      try {
        return func.apply(this, args);
      } catch (err) {
        return TO_JSON_FAILED_MESSAGE;
      }
    },
  });

  this.buffer = makeLoggable(function () {
    return `<Buffer[${Buffer.byteLength(this)}]>`;
  });

  return Object.freeze(this);
}

function xerrorSerializer(err, recurseCount = 2) {
  if (!err || !err.xerror) {
    return bunyan.stdSerializers.err(err);
  }

  let obj = {};
  obj.name = err.name;
  obj.message = err.message;
  if (err.code) obj.code = err.code;
  if (err.status) obj.status = err.status;
  if (err.cause && recurseCount > 0) obj.cause = xerrorSerializer(err.cause, recurseCount - 1);
  if (err.data) obj.data = err.data;
  if (err.tags) obj.tags = err.tags;
  if (err.stack) obj.stack = err.stack;
  return obj;
}
