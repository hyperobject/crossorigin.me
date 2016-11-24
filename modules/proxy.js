const request = require('request');
/*
get handler handles standard GET reqs as well as streams
*/
function get (req, res, next) {
    console.log(req.url); //eslint-disable-line
    res.header('Access-Control-Allow-Origin', '*'); // Actually do the CORS thing! :)

    var data = 0; // This variable contains the size of the data (for limiting file size)
    var limit = 2e6; //TODO: change this to something different depending on tier. It's fine for now.
    request
        .get(req.params[0]) // GET the document that the user specified
        .on('response', function (response) {
            res.statusCode = response.statusCode;
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
