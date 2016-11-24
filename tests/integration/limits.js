/* eslint-disable no-unused-vars */
const supertest = require('supertest');
const server = supertest(require('../../modules/server.js'));

describe('Large file request', function () {
    it('should only serve 2MB of data', function (done) { // Will attempt to fetch a 4.3MB file
        server
        .get('/https://01.keybase.pub/big.jpg')
        .expect(res => res.body.length < 2e6)
        .expect(200, done);
    });
});
