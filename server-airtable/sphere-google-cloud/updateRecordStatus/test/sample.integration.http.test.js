const supertest = require('supertest');
const assert = require("assert");
const { getTestServer } = require('@google-cloud/functions-framework/testing');

require('../');
describe('updateRecordStatus: airtable integration test', () => {
  it('updateRecordStatus: .get request should return pre-defined string', async () => {
    const server = getTestServer('updateRecordStatus');
    await supertest(server)
      .get('/')
      .expect(200)
      .then(response => {
        assert.strictEqual(response.res.text, 'only POST method is supported')
      })
  });
  
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
  
  it('updateRecordStatus: record has "Like" status after .post like request', async () => {
    const server = getTestServer('updateRecordStatus');
    await supertest(server)
      .post('/')
      .send({ recordId: 'rec7th1mbahsx1BdT', newStatus: 'Like' })
      .expect(200)
      .then(response => {
        // assert.strictEqual(response.body.length, 104)
        assert.strictEqual(response.status, 200)
        assert.strictEqual(response.body.fields.Status.includes('Like'), true)
      })
  });
  
  it('updateRecordStatus: set "Disliked" status', async () => {
    const server = getTestServer('updateRecordStatus');
    await supertest(server)
      .post('/')
      .send({ recordId: 'rec7th1mbahsx1BdT', newStatus: 'Disliked' })
      .expect(200)
      .then(response => {
        // assert.strictEqual(response.body.length, 104)
        assert.strictEqual(response.status, 200)
        assert.strictEqual(response.body.fields.Status.includes('Disliked'), true)
      })
  });
  
  it('updateRecordStatus: set "Archived" status', async () => {
    const server = getTestServer('updateRecordStatus');
    await supertest(server)
      .post('/')
      .send({ recordId: 'rec7th1mbahsx1BdT', newStatus: 'Archived' })
      .expect(200)
      .then(response => {
        // assert.strictEqual(response.body.length, 104)
        assert.strictEqual(response.status, 200)
        assert.strictEqual(response.body.fields.Status.includes('Archived'), true)
      })
  });
  
  it('updateRecordStatus: set "Playing" status', async () => {
    const server = getTestServer('updateRecordStatus');
    await supertest(server)
      .post('/')
      .send({ recordId: 'rec7th1mbahsx1BdT', newStatus: 'Playing' })
      .expect(200)
      .then(response => {
        // assert.strictEqual(response.body.length, 104)
        assert.strictEqual(response.status, 200)
        assert.strictEqual(response.body.fields.Status.includes('Playing'), true)
      })
  });
  
  it('updateRecordStatus: can\'t set non-existing user-defined status (.e.g "Fake_status")', async () => {
    const server = getTestServer('updateRecordStatus');
    await supertest(server)
      .post('/')
      .send({ recordId: 'rec7th1mbahsx1BdT', newStatus: 'Fake_status' })
      .expect(422)
  });
  
  it('updateRecordStatus: can\'t set part of the actual status (can\'t set "Dislike" instead of "Disliked"', async () => {
    const server = getTestServer('updateRecordStatus');
    await supertest(server)
      .post('/')
      .send({ recordId: 'rec7th1mbahsx1BdT', newStatus: 'Dislike' })
      .expect(422)
  });
});
