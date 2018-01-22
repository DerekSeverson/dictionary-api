'use strict';

const request = require('request-promise');

const LIMIT = 50;

class OxfordApiClient {

  constructor(config) {
    this.url = config.url || 'https://od-api.oxforddictionaries.com/api/v1';
    this.id = config.id;
    this.key = config.key;
  }

  async _request(config) {

    config.url = `${this.url}${config.url}`;
    config.json = true;
    config.resolveWithFullResponse = true;
    config.headers = Object.assign({}, config.headers, {
      app_id: this.id,
      app_key: this.key,
    });

    return await request(config);
  }

  async search({ query, limit = LIMIT, offset = 0, prefix = true }) {

    return await this._request({
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

    return await this._request({
      method: 'GET',
      url: `/entries/en/${id}`,
    });
  }

}

exports = module.exports = OxfordApiClient;
