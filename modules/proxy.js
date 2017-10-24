const request = require('request');

const blockedPhrases = new RegExp(/porn|sexy/); // No thank you.

let requireHeader = [
    'origin',
    'x-requested-with',
];

let clientHeadersBlacklist = new Set([
    'host',
    'cookie',
]);
let serverHeadersBlacklist = new Set([
    'set-cookie',
    'connection',
]);

var sizeLimit = 2e6; //TODO: change this to something different depending on tier. It's fine for now.
/*
get handler handles standard GET reqs as well as streams
*/
const proxy = method => (req, res, next) => {

    res.header('Access-Control-Allow-Origin', '*'); // Actually do the CORS thing! :)

    let url;
    switch (method) {
    case 'GET':
        url = req.url.substr(1);
        break;
    case 'POST':
        url = req.params[0];
        break;
    }

    // disallow blocked phrases
    if (url.match(blockedPhrases)) {
        res.statusCode = 403;
        return res.end('Phrase in URL is disallowed.');
    }

    // require Origin header
    if (!requireHeader.some(header => req.headers[header])) {
        res.statusCode = 403;
        return res.end('Origin: header is required');
    }

    // TODO redirect same origin
    /* from cors-anywhere: boolean redirectSameOrigin - If true, requests to
     * URLs from the same origin will not be proxied but redirected. The
     * primary purpose for this option is to save server resources by
     * delegating the request to the client (since same-origin requests should
     * always succeed, even without proxying). */

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
    request(url, {method, headers}) // request the document that the user specified
        .on('response', function (page) {
            // Check content length - if it's larger than the size limit, end the request with a 413 error.
            if (Number(page.headers['content-length']) > sizeLimit) {
                res.statusCode = 413;
                res.end('ERROR 413: Maximum allowed size is ' + sizeLimit + ' bytes.');
            }
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
            if (data > sizeLimit){
                res.abort(); // kills response and request cleanly
            }
        })
        .on('end', function (){
            res.end(); // End the response when the stream ends
        })
        .pipe(res); // Stream requested url to response
    next();
};

/*
opts handler allows us to use our own CORS preflight settings
*/
function opts (req, res, next) { // Couple of lines taken from http://stackoverflow.com/questions/14338683
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET'); // Only allow GET for now
    res.header('Access-Control-Allow-Headers', req.header('Access-Control-Request-Headers'));
    res.header('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hrs if supported
    res.send(200);
    next();
}

const get = proxy('GET');
const post = proxy('POST');

module.exports = {get, post, opts};
