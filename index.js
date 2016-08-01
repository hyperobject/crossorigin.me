#!/usr/bin/env node
var http = require('http'),
    request = require('request'),
    fs = require('fs'),
    fsRead = fs.readFileSync,
    gzip = require('zlib').gzipSync,
    domain = require('domain'),
    chalk = require('chalk');


var index = fsRead('index.html');
var indexGzip = gzip(index);

var favicon = fsRead('favicon.ico');
var faviconGzip = gzip(favicon);
var faviconPNG = fsRead('favicon.png');
var faviconPNGGZip = gzip(faviconPNG);

var port = process.env.PORT || 8080;
var debug = process.argv.indexOf('--debug') != -1;

var errorString = chalk.red;
var normalString = chalk.yellow;

var allowedOriginalHeaders = new RegExp('^' + require('./allowedOriginalHeaders.json').join('|'), 'i'),
    bannedUrls = new RegExp(require('./bannedUrls.json').join('|'), 'i'),
    defaultOptions = {
        gzip:true
    },
    requestOptions = {
        encoding: null,
        rejectUnauthorized: false,
        headers: {
            'accept-encoding': 'gzip'
        }
    };

var sizeLimit = process.env.SIZE_LIMIT || 2e6; // 2MB - change this to false if you want unlimited file size

var server = http.createServer(function (req, res) {
    var d = domain.create();
    d.on('error', function (e){
        res.statusCode = 500;
        if (e.message != 'Large File' && (debug && e.message == 'Parse Error')){
            console.log(errorString(chalk.bold('Error: ') + (debug ? e.stack : e.message)));
            res.end('Error: ' + ((e instanceof TypeError) ? 'make sure your URL is correct' : e.message));
        }
        res.end();
    });
    d.add(req);
    d.add(res);

    d.run(function() {
        handler(req, res);
    });
});

server.listen(port);

console.log(chalk.cyan('Listening on port %s'),port);
if (debug){
    console.log(chalk.bold.magenta('Running in debug mode!'));
    if (sizeLimit){
        console.log(chalk.magenta('Maximum file size is %s bytes'), sizeLimit);
    }
}

var acceptsGzip = function acceptsGzip (req, res, normal, gzipped) {
    if (/gzip/g.test(req.headers['accept-encoding'])) {
        res.setHeader('content-encoding', 'gzip');
        res.write(gzipped);
    }
    else {
        res.write(normal);
    }
    res.end();
};

var handleOptions = function handleOptions (res, req) {
    var options,
        opts = JSON.parse(JSON.stringify(requestOptions));
    var url = req.url.split(']http');
    try {
        options = JSON.parse(('{'+ url[0].substr(2) + '}').replace(/([a-z][^:]*)(?=\s*:)/g, '"$1"'));
    } catch (e) {
        options = {};
    }

    opts.uri = url[1] ? 'http' + url[1] : url[0].substr(1);
    opts.flags = {};

    for (var i in defaultOptions) {
        options[i] = (typeof options[i] === 'boolean' ? options[i] : defaultOptions[i]);

        switch (i) {
        case 'gzip':
            if (options.gzip === false) {
                opts.headers['accept-encoding'] = 'identity';
            }
            else {
                opts.headers['accept-encoding'] = 'gzip';
                opts.flags.gzip = true;
            }
            break;
        }
    }
    opts.method = req.method;
    opts.headers['Content-Type'] = req.headers['content-type'];
    opts.followAllRedirects = true;
    opts.body = req;
    return opts;
};

var handler = function handler(req, res) {
    switch (bannedUrls.test(req.url) || req.url) {
    case '/':
    case '/index.html' :
        res.setHeader('content-type', 'text/html');
        acceptsGzip(req, res, index, indexGzip);
        break;
    case '/favicon.ico':
        res.setHeader('content-type', 'image/x-icon');
        acceptsGzip(req, res, favicon, faviconGzip);
        break;
    case '/favicon.png':
        res.setHeader('content-type', 'image/png');
        acceptsGzip(req, res, faviconPNG, faviconPNGGZip);
        break;
    case true:
        res.writeHead(403);
        res.end('FORBIDDEN');
        break;
    default:
        res.setTimeout(25000);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Credentials', false);
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Expires', new Date(Date.now() + 86400000).toUTCString()); // one day in the future
        var options = handleOptions(res, req);
        var r = request(options);
        r.pipefilter = function(response, dest) {
            var size = 0;
            //var ip;
            response.on('data', function(chunk){
                size += chunk.length;
                if (sizeLimit && size > sizeLimit){
                    size = errorString('over max');
                    response.end();
                }
            });
            response.on('end', function(){
                console.log(normalString('Request for %s, size ' + size + ' bytes'), req.url);
                /*if (debug){
                    ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress ||req.connection.socket.remoteAddress;
                    console.log(chalk.magenta('Originated from ' + req.headers['x-forwarded-for']));
                }*/
            });
            for (var header in response.headers) {
                if (!allowedOriginalHeaders.test(header)) {
                    dest.removeHeader(header);
                }

                if (options.flags.gzip === true && header === 'content-encoding') {
                    dest.setHeader('content-encoding', response.headers[header]);
                }
            }
        };
        r.pipe(res);
    }
};
