var http = require('http'),
    Log = require('log'),
    log = new Log('info'),
    config = require('./config')
    ;

var port = process.env.PORT ? process.env.PORT : 3000;

var handlerObject = config.handler.name ? config.handler.name : 'FileSystemHandler';
log.info('Loading Hander: ' + handlerObject);
var Handler = require('./handlers/' + handlerObject);
var handler = new Handler(config.handler.config ? config.handler.config : {});

log.info('Loading registered Methods');
if (config.methods) {
    config.methods.forEach(function(item) {
        
    });
}

log.info('Running on port: ' + port);

http.createServer(function (req, res) {
    var host = req.headers.host;
    if (host.indexOf(':')) host = host.substring(0, host.indexOf(':'));
    var url = req.url;
    if (url[0] == '/') url = url.substr(1, url.length - 1);
    var urlParts = url.split('/');
    var currentConfig = config.domains[host];
    if (currentConfig) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Congrat');
    } else {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end('Domain is not configured.');
    }
}).listen(port);