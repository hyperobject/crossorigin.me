/* eslint-disable no-unused-vars */
const supertest = require('supertest');
const server = supertest(require('../../modules/server.js'));

describe('Large file request', function () {
    it('should only serve 2MB of data', function (done) { // Will attempt to fetch a 3.1MB file
        server
        .get('/https://01.keybase.pub/big.jpg')
        .set('Origin', 'http://example.com')
        .expect(function (res) {
            res.body.length < 2e6;
        })
        .expect(function (res) {
            res.statusCode == 200 || res.statusCode == 413;
        })
        .end(done);
    });
});
