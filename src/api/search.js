'use strict';

const ajv = require('app/ajv');
const XError = require('x.error');

const validate = ajv.compile({
  title: 'SearchQueryParameters',
  type: 'object',
  properties: {
    q: { type: 'string' },
    limit: {
      type: 'integer',
      minimum: 1,
      maximum: 200,
      default: 50,
      description: 'Limit Search Results',
    },
    offset: {
      type: 'integer',
      minimum: 0,
      default: 0,
      description: 'Offset Search Results',
    },
  },
  required: ['q'],
});

exports = module.exports = async ctx => {

  const { query } = ctx.request;

  if (!validate(query)) {
    XError.throw({
      message: 'Invalid Request Query Parameters',
      status: 400,
      errors: validate.errors,
      data: { query },
    });
  }

  const response = await ctx.oxford
    .search({
      query: query.q,
      limit: query.limit,
      offset: query.offset,
    })
    .catch(reason => {
      ctx.log.error({ reason }, 'Oxford Request Error');
      throw reason;
    })
    .catch(reason => XError.throw({
      message: 'Request to Oxford Dictionary API Failed.',
      status: 400,
      cause: reason.cause,
      data: { response: getLimitedResponse(reason) },
    }));

  const { metadata, results } = response.body;
  const { total, limit, offset } = metadata;

  ctx.body = {
    metadata: {
      total,
      limit,
      offset,
    },
    results: results.map(item => item.word),
  };

};

// Helper Functions

function getLimitedResponse(reason) {
  return (
    reason &&
    reason.response &&
    ({
      statusCode: reason.response.statusCode,
      statusMessage: reason.response.statusMessage,
      body: reason.response.body,
    })
  );
}
