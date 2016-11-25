/* eslint-disable no-unused-vars */
const supertest = require('supertest');
const server = supertest(require('../../modules/server.js'));

describe('Request with cache control headers', function () {
    it('should pass those headers through', function (done) { // Will attempt to fetch a 3.1MB file
        server
        .get('/https://api.scratch.mit.edu')
        .set('Origin', 'http://example.com')
        .expect('Cache-Control', /max-age/)
        .expect(200, done);
    });
});
