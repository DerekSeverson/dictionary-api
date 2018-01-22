'use strict';

const env = require('ensure-env');
const Oxford = require('modules/oxford-api-client');

exports = module.exports = new Oxford({
  id: env('OXFORD_APP_ID'),
  key: env('OXFORD_APP_KEY'),
});
