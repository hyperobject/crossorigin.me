#!/usr/bin/env node
var http = require('http')
var request = require('request')
var fs = require('fs');
var index = fs.readFileSync('index.html');

var port = process.env.PORT || 8080

http.createServer(function (req, res) {
  console.log(req.url);
  res.setTimeout(25000)
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.url == "/"){
  	res.writeHead(200);
  	res.write(index);
  	res.end();
  }else{
  try {
    request(req.url.slice(1), {encoding: null}, function(error, response, body) {
      res.write(body)
      res.end()
    })
  }
  catch(e) {}}
}).listen(port)

console.log("Listening on port: " + port)
