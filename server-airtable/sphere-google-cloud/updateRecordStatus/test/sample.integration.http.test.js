const supertest = require('supertest');
const assert = require("assert");
const { getTestServer } = require('@google-cloud/functions-framework/testing');

require('../');
describe('updateRecordStatus: airtable integration test', () => {
  it('updateRecordStatus: .post should work ', async () => {
    const server = getTestServer('updateRecordStatus');
    await supertest(server)
      .post('/')
      .send({ recordId: 'rec7th1mbahsx1BdT', newStatus: 'Playing' })
      .expect(200)
      .then(response => {
        // assert.strictEqual(response.body.length, 104)
        assert.strictEqual(response.status, 200)
      })
  });
});
