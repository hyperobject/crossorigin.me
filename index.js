#!/usr/bin/env node
var http = require('http'),
	request = require('request'),
	fs = require('fs'),
	domain = require('domain'),
	index = require('zlib').gzipSync(fs.readFileSync('index.html'))
	favicon = require('zlib').gzipSync(fs.readFileSync('favicon.ico'))
	faviconPNG = require('zlib').gzipSync(fs.readFileSync('favicon.png'))
	port = process.env.PORT || 8080,
	allowedOriginalHeaders = new RegExp('^' + require('./allowedOriginalHeaders.json').join('|'), 'i')
	bannedUrls = new RegExp(require('./bannedUrls.json').join('|'), 'i'),
	requestOptions = {
		encoding: null,
		rejectUnauthorized: false,
		headers: {
			'accept-encoding': 'identity'
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
	handler = function handler(req, res) {
		switch (req.url) {
			case "/":
			case "/index.html" :
				res.setHeader('content-type', 'text/html')
				res.setHeader('content-encoding', 'gzip')
				res.writeHead(200);
				res.write(index);
				res.end();
				break;
			case "/favicon.ico":
				res.setHeader('content-encoding', 'gzip')
				res.setHeader('content-type', 'image/x-icon')
				res.writeHead(200);
				res.write(favicon);
				res.end();
				break;
			case "/favicon.png":
				res.setHeader('content-encoding', 'gzip')
				res.setHeader('content-type', 'image/png')
				res.writeHead(200);
				res.write(faviconPNG);
				res.end();
				break;
			default:
				if (bannedUrls.test(req.url)) {
					res.writeHead(403);
					res.end('FORBIDDEN');
				} else {
				try {
					res.setTimeout(25000);
					res.setHeader('Access-Control-Allow-Origin', '*');
					res.setHeader('Access-Control-Allow-Credentials', false);
					res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
					res.setHeader('Expires', new Date(Date.now() + 86400000).toUTCString()); // one day in the future
					var r = request(req.url.slice(1), requestOptions);
					r.pipefilter = function(response, dest) {
						for (var header in response.headers) {
							if (!allowedOriginalHeaders.test(header)) {
								dest.removeHeader(header);	
							}
						}
					};
					r.pipe(res);
				} catch (e) {
					res.end('Error: ' +  ((e instanceof TypeError) ? "make sure your URL is correct" : String(e)));
				}
			}
		}
	}
