/* eslint-disable no-unused-vars */
const supertest = require('supertest');
const server = supertest(require('../../modules/server.js'));

describe('URL handler', function () {
    it('should pass through query parameters', function (done) {
        server
        .get('/https://queryparameter.herokuapp.com/?test=success')
        .set('Origin', 'http://example.com')
        .expect(function (res) {
            res.body = 'woot! success';
        })
        .expect(200, done);
    });
});
