const supertest = require('supertest');
const assert = require("assert");
const { getTestServer } = require('@google-cloud/functions-framework/testing');

require('../');
describe('getRecords: airtable integration test', () => {
  it('getRecords: getRecords: should return 104 records', async () => {
    const server = getTestServer('getRecords');
    await supertest(server)
      .get('/')
      .expect(200)
      .then(response => {
        assert.strictEqual(response.body.length, 104)
      })
  });
  
  it('getRecords?status=Disliked: should return 4 records', async () => {
    const server = getTestServer('getRecords');
    await supertest(server)
      .get('/')
      .query({ status: 'Disliked' })
      .expect(200)
      .then(response => {
        assert.strictEqual(response.body.length, 4)
      })
  })
  
  it('getRecords?status=Playing: should return 89 records', async () => {
    const server = getTestServer('getRecords');
    await supertest(server)
      .get('/')
      .query({ status: 'Playing' })
      .expect(200)
      .then(response => {
        assert.strictEqual(response.body.length, 89)
      })
  })
  
  it('getRecords?status=Like: should return 5 records', async () => {
    const server = getTestServer('getRecords');
    await supertest(server)
      .get('/')
      .query({ status: 'Like' })
      .expect(200)
      .then(response => {
        assert.strictEqual(response.body.length, 5)
      })
  })
  
  it('getRecords?status=Archived: should return 15 records', async () => {
    const server = getTestServer('getRecords');
    await supertest(server)
      .get('/')
      .query({ status: 'Archived' })
      .expect(200)
      .then(response => {
        assert.strictEqual(response.body.length, 15)
      })
  })
  
  it('getRecords?byakus:Fake_status: should return all (non-filtered) 104 records', async () => {
    const server = getTestServer('getRecords');
    await supertest(server)
      .get('/')
      .query({ byakus: 'Fake_status' })
      .expect(200)
      .then(response => {
        assert.strictEqual(response.body.length, 104)
      })
  })
});
