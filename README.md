thumb-me
========

A minimalistic web server created for one job: making thumbnail.

This server are not meant to serve directly to clients, in which you should put this server
behind a web proxy such as nginx.

Thumb-me is config-and-forget sort of program, so after you've configured it, it's ready to go.

This is a work in progress, any contributions are welcome.

Features
========

1. Basic methods: Thumb.
2. Token for self-protection.
3. Multiple domains support.

Known issues
============

1. Cache the result: Although we can cache the generated thumbnails, but I decided that's a bad practice,
and that feature won't be implemented. Please use a reverse web proxy (such as nginx) to cache the
generated thumbnails.
2. Handler data from other system: such as redis or mongodb. This feature will be implemented in the near
future. But in the mean time, I don't have enough time to implement this feature, so any contributions in
this area are welcomed.
3. Upload method: I want to keep the code base as simple as possible, so there will be no upload method.

How it works?
=============

1. Request come to thumb-me. If thumb-me found the file, it will directly serve this file.
2. If no found is found, thumb-me will try to extract information from url. A typical url should look like:
http://storage.local/method/param1_param2_param3/token/url/to/file.png.
3. If there's a method to handle this url, the extracted information will be passed to this method.
4. If there's no method to handle this url, a 404 header will be sent to the client.

Configuration
=============

Make a copy of ```config.default.js``` and rename it to ```config.js```. A typical configuration will look like:

```javascript
module.exports = {
    "path": "./storage",
    "methods": ["Thumb"],
    "domains": {
        "localhost": {
            key: "EzcOR2ED4y15wqg"
        }
    }
};
```

The ```path``` key is used to define the storage directory for the ```FileSystemHandler```. Default location is the
```storage``` directory relative to the thumb-me directory.

The ```methods``` key is used to register the methods which are used by thumb-me to generate result. You can create
new method, and add to the ```methods``` array (minus the suffix ```Method```; so ```ThumbMethod``` will be added as
```Thumb``` ).

The ```domains``` key is used to register the domains will be handled by ```thumb-me```. Any unregistered domain will
be ignored. The ```key``` of each domains, is used to generate the token of the url.

Nginx as reverse web proxy and cache the result
===============================================

Nginx will act as a reverse proxy, and cache the response from thumb-me, this will greatly boost the performance.
Add the following lines inside the ```http``` directive:

```
proxy_cache_path /tmp/nginx keys_zone=one:30m loader_threshold=300 loader_files=200;
```

Virtual host configuration:

```
server {
        listen 80;
        server_name storage.local;
        access_log off;
        error_log /home/storage/logs/err.log;

        location  / {
		proxy_pass http://127.0.0.1:3000/;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header host $host;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_cache one;
		proxy_cache_valid any 12h;
        }
}
```

And you're ready to go.