/* eslint-disable no-unused-vars */
const supertest = require('supertest');
const server = supertest(require('../../modules/server.js'));

describe('Simple CORS request', function () {
    it('should include the correct headers', function (done) {
        server
        .get('/https://google.com')
        .expect(200)
        .expect('Access-Control-Allow-Origin', '*')
        .end(function (err, res) {
            if (err) return done(err);
            done();
        });
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
