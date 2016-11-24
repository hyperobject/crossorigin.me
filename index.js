const server = require('./modules/server');
var memwatch = require('memwatch-next');
memwatch.on('leak', function(info) {console.log(info);}); //eslint-disable-line
server.listen(process.env.PORT || 8080, function () {
  console.log('%s listening at %s', server.name, server.url); //eslint-disable-line
});
