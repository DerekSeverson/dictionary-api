'use strict';

const ajv = require('ajv')({
  useDefaults: true,
  coerceTypes: 'array',
});

ajv.addSchema({
  type: 'string',
  format: 'uuid',
}, 'uuid');

ajv.addSchema({
  type: 'array',
  items: {
    type: 'string',
    format: 'uuid',
  },
}, 'uuids');

exports = module.exports = ajv;
