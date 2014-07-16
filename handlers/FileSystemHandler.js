var config = require('../config.js'),
    path = require('path'),
    fs = require('fs');

function FileSystemHandler() {
}

FileSystemHandler.prototype.get = function(file, host, mime, res) {
    res.writeHead(200, {'Content-Type': mime});
    var filePath = this.resolve(file, host);
    var stream = fs.createReadStream(filePath);
    stream.pipe(res);
};

FileSystemHandler.prototype.getHostDir = function(host) {
    var storageDir = path.resolve(process.cwd(), config.path);
    return path.join(storageDir, host);
};

FileSystemHandler.prototype.resolve = function(file, host) {
    var hostDir = this.getHostDir(host);
    return path.join(hostDir, file);
};

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