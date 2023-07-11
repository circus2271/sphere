const supertest = require('supertest');
const assert = require("assert");
const { getTestServer } = require('@google-cloud/functions-framework/testing');
require('dotenv').config()

const { BASE_ID, TABLE_ID, ALLOWED_ORIGINS_JSON } = process.env
const mainAllowedOrigin = JSON.parse(ALLOWED_ORIGINS_JSON)[0];


require('../');
describe('updateRecordStatus: airtable integration test', () => {
  it('"not .post" and "not OPTIONS" http request methods should return 400 status code and a pre-defined string', async () => {
    const server = getTestServer('updateRecordStatus');
    await supertest(server)
      .get('/')
      .expect(400)
      .then(response => {
        assert.strictEqual(response.res.text, 'only POST and OPTIONS http request methods are supported')
      })
  });
  
  it('.post without baseId and tableId should return 404 and a pre-defined message string', async () => {
    const server = getTestServer('updateRecordStatus');
    await supertest(server)
      .post('/')
      .send({ recordId: 'rec7th1mbahsx1BdT', newStatus: 'Like' })
      .expect(400)
      .then(response => {
        assert.strictEqual(response.text, 'please, provide baseId and tableId with your request')
      })
  });
  
  it('.post request has no recordId and/or no newStatus', async () => {
    const server = getTestServer('updateRecordStatus');
    await supertest(server)
      .post('/')
      .send({
        baseId: BASE_ID,
        tableId: TABLE_ID,
      })
      .expect(400)
      .then(response => {
        assert.strictEqual(response.text, 'please, provide recordId and a new status (newStatus) with your request')
      })
  });
  
  it('record has "Like" status after .post with like request', async () => {
    const server = getTestServer('updateRecordStatus');
    await supertest(server)
      .post('/')
      .send({
        baseId: BASE_ID,
        tableId: TABLE_ID,
        recordId: 'rec7th1mbahsx1BdT',
        newStatus: 'Like'
      })
      .expect(200)
      .then(response => {
        assert.strictEqual(response.body.fields['Like/Dislike'].includes('Like'), true)
      })
  });
  
  it('record has "Dislike" status after .post with dislike request', async () => {
    const server = getTestServer('updateRecordStatus');
    await supertest(server)
      .post('/')
      .send({
        baseId: BASE_ID,
        tableId: TABLE_ID,
        recordId: 'rec7th1mbahsx1BdT',
        newStatus: 'Like'
      })
      .expect(200)
      .then(response => {
        assert.strictEqual(response.body.fields['Like/Dislike'].includes('Dislike'), true)
      })
  });
  
  it('can\'t set non-existing user-defined status (for example "Fake_status")', async () => {
    const server = getTestServer('updateRecordStatus');
    await supertest(server)
      .post('/')
      .send({
        baseId: BASE_ID,
        tableId: TABLE_ID,
        recordId: 'rec7th1mbahsx1BdT',
        newStatus: 'Fake_status'
      })
      .expect(422)
  });
  
  it('can\'t set part of the actual status (can\'t set "Disl" instead of "Dislike"', async () => {
    const server = getTestServer('updateRecordStatus');
    await supertest(server)
      .post('/')
      .send({
        baseId: BASE_ID,
        tableId: TABLE_ID,
        recordId: 'rec7th1mbahsx1BdT',
        newStatus: 'Disl'
      })
      .expect(422)
  });
  
  it('.post method with non-existing recordId should return 404 error', async () => {
    const server = getTestServer('updateRecordStatus');
    await supertest(server)
      .post('/')
      .send({
        baseId: BASE_ID,
        tableId: TABLE_ID,
        recordId: 'fake_recordId',
        newStatus: 'doesn\'t matter'
      })
      .expect(404)
  });
  
  it('OPTIONS http request method should return 204 status code', async () => {
    const server = getTestServer('updateRecordStatus');
    await supertest(server)
      .options('/')
      .expect(204)
  });
  
  it('sphere main player domain is allowed for cors and "Content-Type" header is allowed', async () => {
    const server = getTestServer('updateRecordStatus');
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
