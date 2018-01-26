'use strict';

const request = require('request-promise');

const LIMIT = 50;
const URL = 'https://od-api.oxforddictionaries.com/api/v1';

class OxfordApiClient {

  constructor(config) {
    this.request = request.defaults({
      baseUrl: config.url || URL,
      headers: {
        app_id: config.id,
        app_key: config.key,
      },
      json: true,
      resolveWithFullResponse: true,
    });
  }

  async search({ query, limit = LIMIT, offset = 0, prefix = true }) {

    return await this.request({
      method: 'GET',
      url: '/search/en',
      qs: {
        q: query,
        limit,
        prefix,
        offset,
      },
    });
  }

  async definition({ word }) {

    if (typeof word !== 'string') {
      throw new Error('Invalid Input');
    }

    // Ex: "Appalacian Mountains" --> "appalacian_mountains"
    const id = word.toLowerCase().replace(/ /g, '_');

    return await this.request({
      method: 'GET',
      url: `/entries/en/${id}`,
    });
  }

}

exports = module.exports = OxfordApiClient;
