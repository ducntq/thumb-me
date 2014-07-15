module.exports = {
    "handler": {
        name: "FileSystemHandler",
        config: {
            "path": "./storage"
        }
    },
    "methods": ["Thumb"],
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