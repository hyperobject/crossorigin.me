#!/usr/bin/env node
var http = require('http')
var request = require('request')
var fs = require('fs');
var domain = require('domain');
var index = fs.readFileSync('index.html');

var port = process.env.PORT || 8080

var server = http.createServer(function (req, res) {
	var d = domain.create();
	d.on('error', function (e){
		console.log('ERROR', e.stack);

		res.statusCode = 500;
		res.end('Error: ' +  ((e instanceof TypeError) ? "make sure your URL is correct" : String(e)));
	});

	d.add(req);
	d.add(res);

	d.run(function() {
		handler(req, res);
	});

}).listen(port);


	function handler(req, res) {
	console.log(req.url);
	
    if (fs.existsSync(req.url.slice(1))){
    	res.writeHead(200);
    	res.write(fs.readFileSync(req.url.slice(1)));
    	res.end()
    } else if (req.url == '/') {
    	res.writeHead(200);
    	res.write(index);
    	res.end();
    } else {
    	try {
			res.setTimeout(25000);
			res.setHeader('Access-Control-Allow-Origin', '*');
			request(req.url.slice(1), {encoding: null}, function(error, response, body) {
      			res.write(body)
      			res.end()
    		})
    	} catch (e) {
    	   	res.end('Error: ' +  ((e instanceof TypeError) ? "make sure your URL is correct" : String(e)));
    	}
    }
}
