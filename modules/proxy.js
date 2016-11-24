const request = require('request');

let clientHeadersBlacklist = new Set([
    'host',
    'cookie',
]);
let serverHeadersBlacklist = new Set([
    'set-cookie',
    'connection',
]);

/*
get handler handles standard GET reqs as well as streams
*/
function get (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // Actually do the CORS thing! :)

    var url = req.params[0];

    // forward client headers to server
    var headers = {};
    for (var header in req.headers) {
        if (!clientHeadersBlacklist.has(header.toLowerCase())) {
            headers[header] = req.headers[header];
        }
    }
    var forwardedFor = req.headers['X-Fowarded-For'];
    headers['X-Fowarded-For'] = (forwardedFor ? forwardedFor + ',' : '') + req.connection.remoteAddress;

    var data = 0; // This variable contains the size of the data (for limiting file size)
    var limit = 2e6; //TODO: change this to something different depending on tier. It's fine for now.
    request
        .get(url, {headers}) // GET the document that the user specified
        .on('response', function (page) {
            res.statusCode = page.statusCode;

            // if the page already supports cors, redirect to the URL directly
            if (page.headers['access-control-allow-origin'] === '*') { // TODO is this best?
                res.redirect(url, next);
            }

            // include only desired headers
            for (var header in page.headers) {
                if (!serverHeadersBlacklist.has(header)) {
                    res.header(header, page.headers[header]);
                }
            }
            // must flush here -- otherwise pipe() will include the headers anyway!
            res.flushHeaders();
        })
        .on('data', function (chunk) {
            data += chunk.length;
            if (data > limit){
                res.abort(); // kills response and request cleanly
            }
        })
        .on('end', function (){
            res.end(); // End the response when the stream ends
        })
        .pipe(res); // Stream requested url to response
    next();
}

/*
post and put handlers both handle sending data to servers
*/
function post (req, res, next) {
    next();
}

function put (req, res, next) {
    next();
}

/*
opts handler allows us to use our own CORS preflight settings
*/
function opts (req, res, next) { // Couple of lines taken from http://stackoverflow.com/questions/14338683
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT'); // Only allow GET, POST, and PUT requests
    res.header('Access-Control-Allow-Headers', req.header('Access-Control-Request-Headers'));
    res.header('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hrs if supported
    res.send(200);
    next();
}

module.exports = {get, post, put, opts};
