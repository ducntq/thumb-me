var config = require('../config.js'),
    path = require('path'),
    fs = require('fs');

/**
 * @constructor
 */
function FileSystemHandler() {
}

/**
 * Get the file directly from file system. Stream buffer to http response.
 * @param file
 * @param host
 * @param mime
 * @param res
 */
FileSystemHandler.prototype.get = function(file, host, mime, res) {
    res.writeHead(200, {'Content-Type': mime});
    var filePath = this.resolve(file, host);
    var stream = fs.createReadStream(filePath);
    stream.pipe(res);
};

/**
 * Get the directory of host
 * @param host
 * @returns {*}
 */
FileSystemHandler.prototype.getHostDir = function(host) {
    var storageDir = path.resolve(process.cwd(), config.path);
    return path.join(storageDir, host);
};

/**
 * Resolve the file path by host's directory
 * @param file
 * @param host
 * @returns {*}
 */
FileSystemHandler.prototype.resolve = function(file, host) {
    var hostDir = this.getHostDir(host);
    return path.join(hostDir, file);
};

/**
 * Check if the file existed in the host's directory
 * @param file
 * @param host
 * @param callback
 */
FileSystemHandler.prototype.exists = function (file, host, callback) {
    var filePath = this.resolve(file, host);
    fs.exists(filePath, function(exists) {
        if (exists) {
            fs.stat(filePath, function (err, stats) {
                if (err) {
                    callback(false);
                }
                if (stats) {
                    callback(stats.isFile());
                } else {
                    callback(false);
                }
            })
        } else {
            callback(false);
        }
    });
};

module.exports = FileSystemHandler;