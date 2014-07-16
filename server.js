var http = require('http'),
    Log = require('log'),
    log = new Log(),
    config = require('./config'),
    path = require('path'),
    mime = require('node-mime'),
    crypto = require('crypto'),
    FileSystemHandler = require('./handlers/FileSystemHandler'),
    handler = new FileSystemHandler(),
    self,
    methods = {}
;

function Server() {
    self = this;
    self.loadMethods();
}

Server.prototype.start = function(port) {
    log.info('Running on port: ' + port);
    http.createServer(function (req, res) {
        var host = req.headers.host;
        if (host.indexOf(':')) host = host.substring(0, host.indexOf(':'));
        var url = req.url;
        if (url[0] == '/') url = url.substr(1, url.length - 1);
        var urlParts = url.split('/');
        var currentConfig = config.domains[host];
        if (currentConfig) {
            handler.exists(url, host, function(result) {
                var fileMime = mime.lookUpType(url);
                if (result) {
                    handler.get(url, host, mime, res);
//                    handler.get(url, host, function(data) {
//                        res.writeHead(200, {'Content-Type': fileMime});
//                        res.end(data);
//                    });
                } else {
                    var urlArray = self.processUrl(url);
                    if (urlArray.method && urlArray.token && urlArray.param && urlArray.url && methods[urlArray.method]) {
                        handler.exists(urlArray.url, host, function(fileExists) {
                            if (fileExists) {
                                var method = methods[urlArray.method];

                                if (self.checkToken(host, currentConfig.key, urlArray.method, urlArray.url, urlArray.token)) {
                                    method.serve(handler, urlArray, host, fileMime, res);
                                } else {
                                    res.writeHead(403, {'Content-Type': 'text/plain'});
                                    res.end('Unauthorized');
                                }
                            } else {
                                res.writeHead(404, {'Content-Type': 'text/plain'});
                                res.end('Not found');
                            }
                        });
                    } else {
                        res.writeHead(404, {'Content-Type': 'text/plain'});
                        res.end('Not found');
                    }
                }
            });
        } else {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end('Domain is not configured.');
        }
    }).listen(port);
};

Server.prototype.loadMethods = function() {
    log.info('Loading registered Methods');
    if (config.methods) {
        config.methods.forEach(function(item) {
            log.info('Registering method: ' + item + 'Method');
            var methodPrototype = require('./methods/' + item + 'Method');
            methods[item.toLowerCase()] = new methodPrototype();
        });
    }
};

Server.prototype.processUrl = function(url) {
    if (url[0] == '/') url = url.substr(1, url.length - 1);
    var urlParts = url.split('/');
    if (urlParts.length >= 4) {
        var result = {};
        result['method'] = urlParts[0];
        result['param'] = urlParts[1];
        result['token'] = urlParts[2];
        var urlArray = urlParts.slice(3, urlParts.length);
        var resultUrl = urlArray.join('/');
        if (resultUrl.indexOf('?') > 0) {
            resultUrl = resultUrl.slice(0, resultUrl.indexOf('?'));
        }
        result['url'] = resultUrl;
        return result;
    } else {
        return null;
    }
};

Server.prototype.md5 = function(input) {
    return crypto.createHash('md5').update(input).digest('hex');
};

Server.prototype.checkToken = function(host, key, method, url, token) {
    var str = host + key + method + url;
    console.log(self.md5(str).slice(0, 8));
    return self.md5(str).slice(0, 8) == token;
};

module.exports = Server;