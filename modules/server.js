const restify = require('restify');
const server = restify.createServer({
    name: 'crossorigin.me'
}); //TODO: add in SSL support

var corsHandler = require('./cors');

server.get(/^\/https?:\/.+/, corsHandler);
module.exports = server;
