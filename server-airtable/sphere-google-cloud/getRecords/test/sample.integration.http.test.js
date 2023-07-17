const supertest = require('supertest');
const assert = require("assert");
const { getTestServer } = require('@google-cloud/functions-framework/testing');
require('dotenv').config()

const { BASE_ID, TABLE_ID, ALLOWED_ORIGINS_JSON } = process.env
const mainAllowedOrigin = JSON.parse(ALLOWED_ORIGINS_JSON)[0]


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
  
  it('.get request to a "Info" table should return 4 records', async () => {
    const server = getTestServer('getRecords');
    await supertest(server)
      .get('/')
      .query({ baseId: BASE_ID, tableId: 'Info' })
      .expect(200)
      .then(response => {
        assert.strictEqual(response.body.length, 4)
      })
  });
  
  it('.get request to a "Info" table should contain 4 "Active" records and 0 "Archived" records', async () => {
    const server = getTestServer('getRecords');
    await supertest(server)
      .get('/')
      .query({ baseId: BASE_ID, tableId: 'Info' })
      .expect(200)
      .then(response => {
        const records = response.body;
        const activeRecords = records.filter(record => record.fields['Status'].includes('Active'))
        const archivedRecords = records.filter(record => record.fields['Status'].includes('Archived'))
  
        assert.strictEqual(activeRecords.length, 4)
        assert.strictEqual(archivedRecords.length, 0)
      })
  });
  
  it('.get second test playlist "test playlist #2" should return 33 records', async () => {
    const anotherTestPlaylistId = 'tblyqMDwKvBNSJPOY' // test playlist #2 id
    const server = getTestServer('getRecords');
    await supertest(server)
      .get('/')
      .query({ baseId: BASE_ID, tableId: anotherTestPlaylistId })
      .expect(200)
      .then(response => {
        assert.strictEqual(response.body.length, 33)
      })
  });
  
  it('.get request with right parameters should return 86 records', async () => {
    const server = getTestServer('getRecords');
    await supertest(server)
      .get('/')
      .query({ baseId: BASE_ID, tableId: TABLE_ID })
      .expect(200)
      .then(response => {
        assert.strictEqual(response.body.length, 86)
      })
  });
  
  it('all records should have "Playing" status and don\'t have "Dislike" status', async () => {
    const server = getTestServer('getRecords');
    await supertest(server)
      .get('/')
      .query({ baseId: BASE_ID, tableId: TABLE_ID })
      .expect(200)
      .then(response => {
        const records = response.body;
        const filteredRecords = records.filter(record => {
          const statusField = record.fields['Status'] || [];
          const likeDislikeField = record.fields['Like/Dislike'] || [];

          return statusField.includes('Playing') && !likeDislikeField.includes('Dislike')
        })
        assert.strictEqual(records.length, filteredRecords.length)
      })
  });
  
  it('.get method should return 0 "Dislike" records', async () => {
    const server = getTestServer('getRecords');
    await supertest(server)
      .get('/')
      .query({ baseId: BASE_ID, tableId: TABLE_ID })
      .expect(200)
      .then(response => {
        const records = response.body;
        const dislikedRecords = records.filter(record => (record.fields['Like/Dislike'] || []).includes("Dislike"))
        assert.strictEqual(dislikedRecords.length, 0)
      })
  });
  
  it('"not .get" and "not OPTIONS" http request methods should return 400 status with a \'pre-defined\' error message string', async () => {
    const server = getTestServer('getRecords');
    await supertest(server)
      .post('/')
      .expect(400)
      .then(response => {
        assert.strictEqual(response.text, 'only GET and OPTIONS http request methods are supported')
      })
  });
  
  it('OPTIONS http request method should return 204 status code', async () => {
    const server = getTestServer('getRecords');
    await supertest(server)
      .options('/')
      .expect(204)
  });
  
  it('sphere main player domain is allowed for cors and "Content-Type" header is allowed', async () => {
    const server = getTestServer('getRecords');
    await supertest(server)
      .options('/')
      .set('origin', mainAllowedOrigin)
      .then(response => {
        // response headers are converted to lowercase, but their values aren't
        assert.strictEqual(response.headers['access-control-allow-origin'], mainAllowedOrigin)
        assert.strictEqual(response.headers['access-control-allow-headers'], 'Content-Type')
      })
  });
});
