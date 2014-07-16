var http = require('http'),
    Log = require('log'),
    log = new Log(),
    config = require('./config'),
    mime = require('node-mime'),
    crypto = require('crypto'),
    FileSystemHandler = require('./handlers/FileSystemHandler'),
    handler = new FileSystemHandler(),
    self, // refer to this
    methods = {} // list of methods
;

function Server() {
    self = this;
    self.loadMethods();
}

Server.prototype.start = function(port) {
    log.info('Running on port: ' + port);
    http.createServer(function (req, res) {
        // extract the hostname
        var host = req.headers['host'];
        if (host.indexOf(':') >= 0) host = host.substring(0, host.indexOf(':'));
        // extract url
        var url = req.url;
        if (url[0] == '/') url = url.substr(1, url.length - 1);

        // extract the config of current domain
        var currentConfig = config.domains[host];
        if (currentConfig) {
            // check if the requested file is existed
            handler.exists(url, host, function(result) {
                // mime of url
                var fileMime = mime.lookUpType(url);
                if (result) {
                    // if file existed, stream the file to response
                    handler.get(url, host, mime, res);
                } else {
                    // process url to get the method, param, token, url
                    var urlArray = self.processUrl(url);

                    // check if everything is alright
                    if (urlArray &&
                        urlArray['method'] !== undefined
                        && urlArray['token'] !== undefined
                        && urlArray['param'] !== undefined
                        && urlArray['url'] !== undefined
                        && methods[urlArray.method] !== undefined) {
                        // if the requested file is existed, let the method handles
                        handler.exists(urlArray.url, host, function(fileExists) {
                            if (fileExists) {
                                var method = methods[urlArray.method];

                                if (self.checkToken(host, currentConfig.key, urlArray.method, urlArray.param, urlArray.url, urlArray.token)) {
                                    // let the method serve
                                    method.serve(handler, urlArray, host, fileMime, res);
                                } else {
                                    // or the token is wrong, send 403
                                    res.writeHead(403, {'Content-Type': 'text/plain'});
                                    res.end('Unauthorized');
                                }
                            } else {
                                // file not there?
                                res.writeHead(404, {'Content-Type': 'text/plain'});
                                res.end('Not found');
                            }
                        });
                    } else {
                        // file not there?
                        res.writeHead(404, {'Content-Type': 'text/plain'});
                        res.end('Not found');
                    }
                }
            });
        } else {
            // or the domain is not configured
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end('Domain is not configured.');
        }
    }).listen(port); // listen to the port
};

/**
 * Load the registered methods
 */
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

/**
 * Extract the information from the url.
 * A typical url should look like: /method/param/token/url/to/the/file.png
 *
 * @param url
 * @returns {*}
 */
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

/**
 * Generate md5 hash from string
 *
 * @param input
 * @returns {*}
 */
Server.prototype.md5 = function(input) {
    return crypto.createHash('md5').update(input).digest('hex');
};

/**
 * Compare the token
 *
 * @param host
 * @param key
 * @param method
 * @param param
 * @param url
 * @param token
 * @returns {boolean}
 */
Server.prototype.checkToken = function(host, key, method, param, url, token) {
    var str = host + key + param + method + url;
    var result = self.md5(str).slice(0, 8);
    log.debug('Token: ' + result);
    return result == token;
};

module.exports = Server;