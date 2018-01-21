/* eslint callback-return:0 */
'use strict';

exports = module.exports = function makeResponseMiddleware(callback) {

  if (typeof callback !== 'function') {
    throw new Error('ResponseMiddleware - Invalid Callback Parameter');
  }

  return async function responseMiddleware(ctx, next) {
    ctx.body = await callback(ctx, next);
  };
};
