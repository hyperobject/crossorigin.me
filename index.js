#!/usr/bin/env node
var http = require('http');
var request = require('request');
var fs = require('fs');
var domain = require('domain');
var index = fs.readFileSync('index.html');
var favicon = fs.readFileSync('favicon.ico');

var port = process.env.PORT || 8080;

var server = http.createServer(function (req, res) {
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

}).listen(port);


function handler(req, res) {
	console.log(req.url);
	switch (req.url) {
		case "/":
			res.writeHead(200);
			res.write(index);
			res.end();
			break;
		case "/index.html":
			res.writeHead(200);
			res.write(index);
			res.end();
			break;
		case "/favicon.ico":
			res.writeHead(200);
			res.write(favicon);
			res.end();
		default:
			if (req.url.indexOf('vivastreet') > -1){
				res.end('tempbanned');
			} else {
			try {
				res.setTimeout(25000);
				res.setHeader('Access-Control-Allow-Origin', '*');
				res.setHeader('Access-Control-Allow-Credentials', false);
				res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
				request(req.url.slice(1), {encoding: null}, function(error, response, body) {
					res.write(body);
					res.end();
				});
			} catch (e) {
				res.end('Error: ' +  ((e instanceof TypeError) ? "make sure your URL is correct" : String(e)));
			}
		}
	}
}
