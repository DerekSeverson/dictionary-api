'use strict';

const pkg = require('app/package');

exports = module.exports = require('modules/raven')({
  logger: pkg.name,
  release: pkg.version,
});
