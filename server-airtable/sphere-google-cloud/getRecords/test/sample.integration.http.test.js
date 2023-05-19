const supertest = require('supertest');
const assert = require("assert");
const { getTestServer } = require('@google-cloud/functions-framework/testing');
require('dotenv').config()

const { BASE_ID, TABLE_ID } = process.env

require('../');
describe('getRecords: airtable integration test', () => {
  it('.get request without baseId and tableId query parameters should return 400', async () => {
    const server = getTestServer('getRecords');
    await supertest(server)
      .get('/')
      .expect(400)
      .then(response => {
        assert.strictEqual(response.text, 'please, provide baseId and tableId with your request')
      })
  });
  
  it('.get request with right parameters should return 87 records', async () => {
    const server = getTestServer('getRecords');
    await supertest(server)
      .get('/')
      .query({ baseId: BASE_ID, tableId: TABLE_ID })
      .expect(200)
      .then(response => {
        assert.strictEqual(response.body.length, 87)
      })
  });
  
  it('all records should have "Playing" status and don\'t have "Disliked" status', async () => {
    const server = getTestServer('getRecords');
    await supertest(server)
      .get('/')
      .query({ baseId: BASE_ID, tableId: TABLE_ID })
      .expect(200)
      .then(response => {
        const records = response.body;
        const filteredRecords = records.filter(record =>
          record.fields.Status.includes('Playing') && !record.fields.Status.includes('Disliked')
        )
        assert.strictEqual(records.length, filteredRecords.length)
      })
  });
  
  it('.get method should return 0 "Disliked" records', async () => {
    const server = getTestServer('getRecords');
    await supertest(server)
      .get('/')
      .query({ baseId: BASE_ID, tableId: TABLE_ID })
      .expect(200)
      .then(response => {
        const records = response.body;
        const dislikedRecords = records.filter(record => record.fields.Status.includes("Disliked"))
        assert.strictEqual(dislikedRecords.length, 0)
      })
  });
  
  it('"not .get" methods should return 400 status with a \'pre-defined\' error message string', async () => {
    const server = getTestServer('getRecords');
    await supertest(server)
      .post('/')
      .expect(400)
      .then(response => {
        assert.strictEqual(response.text, 'only GET method is supported')
      })
  });
});
