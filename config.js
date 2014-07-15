module.exports = {
    "handler": {
        name: "FileSystemHandler",
        config: {
            "path": "./storage"
        }
    },
    "methods": ["thumb"],
    "headers": [
        {name: "X-Powered-By", value: "thumb-me"}
    ],
    "domains": {
        "img.local": {
            key: "EzcOR2ED4y15wqg"
        },
        "localhost": {
            key: "EzcOR2ED4y15wqg"
        }
    }
};