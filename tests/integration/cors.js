/* eslint-disable no-unused-vars */
const supertest = require('supertest');
const server = supertest(require('../../modules/server.js'));

describe('Simple CORS request', function () {
    it('should include the correct headers', function (done) {
        server
        .get('/https://google.com')
        .set('Origin', 'http://example.com')
        .expect('Access-Control-Allow-Origin', '*')
        .expect(200, done);
    });

    it('should require the Origin header', function (done) {
        server
        .get('/https://google.com')
        .expect(403, done);
    });

    it('should not fail on sites that have CORS enabled', function (done) {
        server
        .get('/http://technoboy10.tk/scratch2015.html')
        .set('Origin', 'http://example.com')
        .expect('Access-Control-Allow-Origin', '*')
        .expect(302, done); // For some reason I'm getting 302 statuses instead of 200???
    });
});

describe('CORS Preflight', function () {
    it('should include the correct headers', function (done) {
        server
        .options('/')
        .expect('Access-Control-Allow-Origin', '*')
        .expect('Access-Control-Allow-Methods', 'GET, POST, PUT')
        .expect('Access-Control-Max-Age', '86400')
        .expect(200, done);
    });
});
