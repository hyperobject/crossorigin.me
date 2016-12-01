const restify = require('restify');
var proxy = require('./proxy');

const server = restify.createServer({
    name: 'crossorigin.me'
});

const freeTier = restify.throttle({
    rate: 3,
    burst: 10,
    ip: true,
    overrides: {
        '192.168.1.1': {
            rate: 0,        // unlimited
            burst: 0
        }
    }
});

// CORS configuration

server.opts('/', proxy.opts);

// Request handler configuration (for free tier)
server.get(/^\/(https?:\/\/.+)/, freeTier, proxy.get);

// These aren't *quite* ready for prime time
//server.post(/^\/(http:\/\/.+)/, freeTier, proxy.post);
//server.put(/^\/(http:\/\/.+)/, freeTier, proxy.put);

module.exports = server;
