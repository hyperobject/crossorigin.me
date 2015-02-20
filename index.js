#!/usr/bin/env node
var http = require('http')
var request = require('request')
var fs = require('fs');
var index = fs.readFileSync('index.html');

var port = process.env.PORT || 8080

var server = http.createServer(function(res, req){
    if fs.existsSync(req.url.slice(1)){
    	res.writeHead(200);
    	res.write(fs.readFileSync(req.url.slice(1)));
    	res.end()
    } else {
    	try {
			res.setTimeout(25000);
			res.setHeader('Access-Control-Allow-Origin: *');
			request(req.url.slice(1), {encoding:null}, function(error, response, body){
				res.writeHead(200);
				res.write(body);
				res.end();
			})
    	} catch (e) {
    		res.writeHead(200);
    		res.write("Error: " + String(e));
    	}
    }
});

server.listen(port);