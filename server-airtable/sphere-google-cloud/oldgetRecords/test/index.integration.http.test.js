const supertest = require('supertest');

const {getTestServer} = require('@google-cloud/functions-framework/testing');
const assert = require("assert");

require('../');
describe('getRecords: airtable integration test', () => {
  it('getRecords: getRecords: should return 104 records', async () => {
    const server = getTestServer('getRecords');
    // const server = getTestServer('helloHttp');
    await supertest(server)
      .get('/')
      .expect(200)
      .then(response => {
        assert.strictEqual(response.data.length, 104)
      })
  });
  // it('helloHttp: should print hello world', async () => {
  //   const server = getTestServer('helloHttp');
  //   await supertest(server).post('/').send().expect(200).expect('Hello World!');
  // });
  // it('helloHttp: should print a name with query', async () => {
  //   const server = getTestServer('helloHttp');
  //   await supertest(server)
  //     .post('/?name=John')
  //     .send()
  //     .expect(200)
  //     .expect('Hello John!');
  // });
  // [START functions_http_integration_test]
});
// [END functions_http_integration_test]
