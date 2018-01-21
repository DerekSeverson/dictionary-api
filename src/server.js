'use strict';

require('app/sentry');
let log = require('app/log');
let config = require('app/config');

// Koa App

let app = require('app');

// Http Server

let server = require('http').createServer(app.callback()); // <-- in-case we want to attach other listeners to the same http server

// Start the Server!

log.debug('Starting Server');

server.listen(config.PORT);

log.debug('Started Server');

// Export server.

exports = module.exports = server;
