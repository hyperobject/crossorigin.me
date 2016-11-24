/* eslint-disable no-unused-vars */
const supertest = require('supertest');
const server = supertest(require('../../modules/server.js'));

describe('Large file request', function () {
    // TODO find a large file on a host with CORS disabled

    // it('should only serve 2MB of data', function (done) { // Will attempt to fetch a 4.3MB file
    //     server
    //     .get('/http://i.imgur.com/00swxq0.png') //eslint-disable-line
    //     .expect(function (res) {
    //         res.body.length < 2e6;
    //     })
    //     .expect(200, done);
    // });
});
