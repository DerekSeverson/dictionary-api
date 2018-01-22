'use strict';

const ajv = require('app/ajv');
const XError = require('x.error');

const validate = ajv.compile({
  title: 'DefinitionWordParameter',
  type: 'string',
  minLength: 1,
  description: 'Word',
  pattern: '^[\\w\\-_]+$',
});

exports = module.exports = async ctx => {

  if (!validate(ctx.params.word)) {
    XError.throw({
      message: 'Invalid Request Url Parameter',
      status: 400,
      errors: validate.errors,
      data: { params: ctx.params },
    });
  }

  const response = await ctx.oxford
    .definition({
      word: ctx.params.word,
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

  const { id, word } = response.body.results[0];
  const definitions = [];
  response.body.results.forEach(result => (
    result && result.lexicalEntries.forEach(lexical => (
      lexical && lexical.entries && lexical.entries.forEach(entry => (
        entry && entry.senses && entry.senses.forEach(sense => (
          definitions.push({
            category: lexical.lexicalCategory,
            definition: sense.definitions && sense.definitions[0],
            examples: sense.examples && sense.examples.map(ex => ex.text),
          })
        ))
      ))
    ))
  ));

  ctx.body = {
    id,
    word,
    definitions,
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
