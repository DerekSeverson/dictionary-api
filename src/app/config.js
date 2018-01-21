'use strict';

let ensure = require('ensure-env');
let pkg = require('app/package');

const config = {};

config.APP_NAME = pkg.name;
config.VERSION = pkg.version;

config.PORT = ensure('PORT');

exports = module.exports = Object.freeze(config);
