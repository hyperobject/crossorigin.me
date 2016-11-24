/* eslint-disable no-unused-vars */
const supertest = require('supertest');
const server = supertest(require('../../modules/server.js'));

describe('Large file request', function () {
    it('should only serve 2MB of data', function (done) { // Will attempt to fetch a 4.3MB file
        server
        .get('/https://upload.wikimedia.org/wikipedia/commons/b/bc/Boulder_Colorado_-_Perl_Street_Mall_-2005-10-14T204331.png') //eslint-disable-line
        .expect(function (res) {
            res.body.length < 2e6;
        })
        .expect(200, done);
    });
});
