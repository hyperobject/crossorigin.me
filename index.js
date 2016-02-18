#!/usr/bin/env node
var http = require('http'),
	request = require('request'),
	fs = require('fs'),
	fsRead = fs.readFileSync,
	gzip = require('zlib').gzipSync,
	domain = require('domain'),
	index = fsRead('index.html')
	indexGzip = gzip(index)
	favicon = fsRead('favicon.ico')
	faviconGzip = gzip(favicon)
	faviconPNG = fsRead('favicon.png')
	faviconPNGGZip = gzip(faviconPNG)
	port = process.env.PORT || 8080,
	allowedOriginalHeaders = new RegExp('^' + require('./allowedOriginalHeaders.json').join('|'), 'i'),
	allowedRequestHeaders = require('./allowedRequestHeaders.json'),
	_ = require('lodash'),
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
	},
	server = http.createServer(function (req, res) {
		var d = domain.create();
		d.on('error', function (e){
			console.log('ERROR', e.stack);
			res.statusCode = 500;
			res.end('Error: ' + ((e instanceof TypeError) ? "make sure your URL is correct" : String(e)));
		});

		d.add(req);
		d.add(res);

		d.run(function() {
			handler(req, res);
		});
	}).listen(port),
	acceptsGzip = function acceptsGzip (req, res, normal, gzipped) {
		if (/gzip/g.test(req.headers['accept-encoding'])) {
			res.setHeader('content-encoding', 'gzip')
			res.write(gzipped);
		}
		else {
			res.write(normal);
		}
		res.end();
	},
	handleOptions = function handleOptions (res, req) {

		var options,
			opts = JSON.parse(JSON.stringify(requestOptions));
			var url = req.url.split(']http')
			try {
				options = JSON.parse(('{'+ url[0].substr(2) + '}').replace(/([a-z][^:]*)(?=\s*:)/g, '"$1"'));
			} catch (e) {
				options = {}
			}

			opts.uri = url[1] ? 'http' + url[1] : url[0].substr(1)
			opts.flags = {}

			for (var i in defaultOptions) {
				options[i] = (typeof options[i] === 'boolean' ? options[i] : defaultOptions[i])

				switch (i) {
					case "gzip":
						if (options.gzip === false) {
							opts.headers['accept-encoding'] = 'identity'
						}
						else {
							opts.headers['accept-encoding'] = 'gzip'
							opts.flags.gzip = true
						}
						break;
				}
			}

		var toLower = function (str) {
			return str.toLowerCase();
		}
		//add headers from original request
		for ( var header of _.map(allowedRequestHeaders, toLower)) {
			opts.headers[header] = req.headers[header]
		}
		return opts
	},
	handler = function handler(req, res) {
		switch (bannedUrls.test(req.url) || req.url) {
			case "/":
			case "/index.html" :
				res.setHeader('content-type', 'text/html')
				acceptsGzip(req, res, index, indexGzip)
				break;
			case "/favicon.ico":
				res.setHeader('content-type', 'image/x-icon')
				acceptsGzip(req, res, favicon, faviconGzip)
				break;
			case "/favicon.png":
				res.setHeader('content-type', 'image/png')
				acceptsGzip(req, res, faviconPNG, faviconPNGGZip)
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
				var options = handleOptions(res, req),
					r = request(options);
				r.pipefilter = function(response, dest) {
					for (var header in response.headers) {
						if (!allowedOriginalHeaders.test(header)) {
							dest.removeHeader(header);
						}
						if (options.flags.gzip === true && header === 'content-encoding') dest.setHeader('content-encoding', response.headers[header])
					}
				};
				r.pipe(res);
		}
	}
