const supertest = require('supertest');
const assert = require("assert");
const { getTestServer } = require('@google-cloud/functions-framework/testing');
require('dotenv').config()

const { ALLOWED_ORIGINS_JSON } = process.env
const allowedOrigins = JSON.parse(ALLOWED_ORIGINS_JSON);


require('../');
describe('login: google cloud integration test', () => {
  it('only POST and OPTIONS http method should be supported', async () => {
    const server = getTestServer('login');
    await supertest(server)
      .get('/')
      .expect(400)
      .then(response => {
        assert.strictEqual(response.text, 'only POST and OPTIONS HTTP request methods are supported')
      })
  });
  
  it('OPTIONS http request method should return 204 status code', async () => {
    const server = getTestServer('login');
    await supertest(server)
      .options('/')
      .expect(204)
  });
  
  it('sphere main player domain is allowed for cors and "Content-Type" header is allowed', async () => {
    const mainPlayerOrigin = 'https://player.sphere.care';
    
    const server = getTestServer('login');
    await supertest(server)
      .options('/')
      .set('origin', mainPlayerOrigin)
      .then(response => {
        // response headers are converted to lowercase, but their values aren't
        assert.strictEqual(response.headers['access-control-allow-origin'], mainPlayerOrigin)
        assert.strictEqual(response.headers['access-control-allow-headers'], 'Content-Type')
      })
  });
  
  describe('.post http method:', () => {
    it('request body should contain non-empty login and password', async () => {
      const server = getTestServer('login')
      await supertest(server)
        .post('/')
        .expect(400)
        .then(response => {
          assert.strictEqual(response.text, 'request body should contain non-empty login and password')
        })
    })
    
    it('.request with wrong login should return 401 status code and a pre-defined message', async () => {
      const server = getTestServer('login')
      await supertest(server)
        .post('/')
        .send({
          login: 'wrong-non-existing-login',
          password: 'doesn\'t matter'
        })
        .expect(401)
        .then(response => {
          assert.strictEqual(response.text, 'user with this login doesn\'t exist')
        })
    })
    
    it('request with existing user and wrong password should return 401', async () => {
      const server = getTestServer('login')
      await supertest(server)
        .post('/')
        .send({
          login: 'Pinia',
          password: 'wrong password 111222'
        })
        .expect(401)
        .then(response => {
          assert.strictEqual(response.text, 'wrong password')
        })
    })
    
    it('request with existing user and correct password should return 200 and a baseId', async () => {
      const server = getTestServer('login')
      await supertest(server)
        .post('/')
        .send({
          login: 'test-user-1',
          password: 'pass1'
        })
        .expect(200)
        .then(response => {
          assert.strictEqual(response.text, 'test-baseId-value')
        })
    })
    
    it('if login is correct but there is no baseId in a firestore request should return 404 and a pre-defined string', async () => {
      const server = getTestServer('login')
      await supertest(server)
        .post('/')
        .send({
          login: 'test-user-2',
          password: 'pass1'
        })
        .expect(404)
        .then(response => {
          assert.strictEqual(response.text, 'successfully logged in, but there is no baseId to send')
        })
    })
  
    it('non-latin characters in login shouldn\'t break anything', async () => {
      const server = getTestServer('login')
      await supertest(server)
        .post('/')
        .send({
          login: 'Piñata',
          password: 'pass'
        })
        .expect(200)
    })
  })
})
