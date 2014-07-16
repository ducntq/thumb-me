var gm = require('gm');

function ThumbMethod() {

}

ThumbMethod.prototype.serve = function (handler, urlArray, host, mime, res) {
    var path = handler.resolve(urlArray.url, host);
    res.writeHead(200, {"Content-Type": mime});
    gm(path).resize(100, 200).noProfile().stream().pipe(res);
};

module.exports = ThumbMethod;