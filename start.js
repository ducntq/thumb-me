var port = process.env.PORT ? process.env.PORT : 3000,
    Server = require('./server'),
    server = new Server()
    ;

server.start(port);