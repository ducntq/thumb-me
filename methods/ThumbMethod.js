var gm = require('gm');

/**
 * Crop at the center the image by the ratio,
 * then resize the image to desired dimensions.
 *
 * @constructor
 */
function ThumbMethod() {

}

/**
 * Serve the request
 *
 * @param handler
 * @param urlArray
 * @param host
 * @param mime
 * @param res
 */
ThumbMethod.prototype.serve = function (handler, urlArray, host, mime, res) {
    var path = handler.resolve(urlArray.url, host);
    var dimensions = urlArray.param.split('_');
    if (dimensions.length > 0) {
        var width = parseInt(dimensions[0]);
        var height = parseInt(dimensions[1]);
        if (width >= 0 && height >= 0) {
            var image = gm(path);
            image.size(function(err, dimensions) {
                if (err) {
                    res.writeHead(404, {"Content-Type": "text/plain"});
                    res.end('Something went wrong');
                }

                var x = 0, y = 0, cropWidth, cropHeight;

                if (width == 0) width = parseInt((height * dimensions.width) / dimensions.height);
                if (height == 0) height = parseInt((width * dimensions.height) / dimensions.width);

                cropWidth = parseInt(dimensions.height * width / height);
                cropHeight = parseInt(dimensions.width * height / width);

                if (width > height) x = parseInt((dimensions.width - cropWidth) / 2);
                else y = parseInt((dimensions.height - cropHeight) / 2);
                console.log(cropWidth, cropHeight, x, y);

                res.writeHead(200, {"Content-Type": mime});
                image.crop(cropWidth, cropHeight, x, y).resize(width, height).noProfile().stream().pipe(res);
            });
        } else {
            res.writeHead(403, {"Content-Type": "text/plain"});
            res.end('Wrong params');
        }
    } else {
        res.writeHead(403, {"Content-Type": "text/plain"});
        res.end('Wrong params');
    }
};

module.exports = ThumbMethod;