const supertest = require('supertest');
const assert = require("assert");
const { getTestServer } = require('@google-cloud/functions-framework/testing');

require('../');
describe('getRecords: airtable integration test', () => {
  it('getRecords: .get request should return 85 records', async () => {
    const server = getTestServer('getRecords');
    await supertest(server)
      .get('/')
      .expect(200)
      .then(response => {
        assert.strictEqual(response.body.length, 85)
      })
  });
  
  it('getRecords: all records should have "Playing" status and don\'t have "Disliked" status' , async () => {
    const server = getTestServer('getRecords');
    await supertest(server)
      .get('/')
      .expect(200)
      .then(response => {
        const records = response.body;
        const filteredRecords = records.filter(record =>
          record.fields.Status.includes('Playing') && !record.fields.Status.includes('Disliked')
        )
        assert.strictEqual(records.length, filteredRecords.length)
      })
  });
  
  it('getRecords: .get method should return 0 "Disliked" records' , async () => {
    const server = getTestServer('getRecords');
    await supertest(server)
      .get('/')
      .expect(200)
      .then(response => {
        const records = response.body;
        const dislikedRecords = records.filter(record => record.fields.Status.includes("Disliked"))
        assert.strictEqual(dislikedRecords.length, 0)
      })
  });
});
