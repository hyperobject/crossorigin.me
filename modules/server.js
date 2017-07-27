const restify = require('restify');
const toobusy = require('toobusy-js');
var proxy = require('./proxy');

const server = restify.createServer({
    name: 'crossorigin.me'
});

server.use(restify.queryParser({ mapParams: false }));

server.use(function (req, res, next) {
    if (toobusy()) {
        res.send(503, 'Server is overloaded! Please try again later.');
    } else {
        next();
    }
});

const freeTier = restify.throttle({
    rate: 3,
    burst: 10,
    xff: true,
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
server.post(/^\/(https?:\/\/.+)/, freeTier, proxy.post);


module.exports = server;
