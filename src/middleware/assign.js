/* eslint callback-return:0 */
'use strict';

const { has, get, set } = require('lodash');

exports = module.exports = function makeAssignMiddleware(to, from, isRequired = true) {

  if (
    (typeof to !== 'string') ||
    ((typeof from !== 'string') && (typeof from !== 'function'))
  ) {
    throw new Error('AssignMiddleware - Invalid Parameter');
  }

  return async function assignMiddleware(ctx, next) {

    let value;
    if (typeof from === 'function') {
      value = await from(ctx);
    } else {
      if (isRequired && !has(ctx, from)) {
        throw new Error('AssignMiddleware - Invalid Path: ' + from);
      }
      value = get(ctx, from);
    }

    set(ctx, to, value);

    await next();
  };
};
