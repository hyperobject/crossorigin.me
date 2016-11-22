const restify = require('restify');
const server = restify.createServer({
    name: 'crossorigin.me'
}); //TODO: add in SSL support

let corsHandler = require('./modules/cors');

server.get(/^\/https?:\/.+/, corsHandler);
server.listen(process.env.PORT || 8080, function () {
  console.log('%s listening at %s', server.name, server.url); //eslint-disable-line
});
