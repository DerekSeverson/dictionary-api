/* eslint global-require: 0 */
'use strict';

const request = require('supertest');
const { assert, expect } = require('chai');

describe('Server', function () {

  const server = require('../index');

  describe('GET /ping', function () {

    it('should return "pong"', async () => {
      await request(server)
        .get('/ping')
        .expect(200)
        .expect(response => {
          assert.equal(response.text, 'pong');
          expect(response.text).to.be.equal('pong');
        });
    });

  });

  after(() => {
    server.close();
  });

});
