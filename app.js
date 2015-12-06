/* Requires */
var s = require('underscore.string');
var express = require('express');
var sockjs = require('sockjs');
var config = require('./config.json');
var utils = require('./lib/utils.js');
var path = require('path');
var pack = require('./package.json');
var log = require('./lib/log.js');

/* Config */
var port = utils.normalizePort(process.env.PORT || config.port);
var app = express();
var server;

/* Express */
app.set('port', port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* Variables */
var chat = sockjs.createServer();
var clients = [];
var users = {};
var bans = [];
var uid = 1;
var currentTime;
var channelId;


/* Routes */
app.use(config.url, express.static(path.join(__dirname, 'public')));
app.get(config.url, function (req, res) {
    res.render('index', {version:pack.version});
});


chat.on('connection', function(conn) {
    conn.on('close', function() {});

    conn.on('data', function(message) {
        // currentTime[conn.id] = Date.now();
        var data = JSON.parse(message);
        handleSocket(clients[conn.id], message);
    });
});


if(!config.ssl.use) {
    var http = require('http');
    server = http.createServer(app);
} else {
    var https = require('https');
    var opt = {
        key: fs.readFileSync(config.ssl.key),
        cert: fs.readFileSync(config.ssl.crt)
    };

    server = https.createServer(opt, app);
}

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function handleSocket(user, message) {
    var data = JSON.parse(message);
    data.id = user.id;
    data.user = user.un;
    data.type = s.escapeHTML(data.type);
    data.message = s.escapeHTML(data.message);
    data.mid = (Math.random() + 1).toString(36).substr(2, 5);

    if (data.type == "open") {

    } else {

    }

    utils.sendToAll(channelId, clients, data);
}


function onError(error) {
    if(error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    switch(error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;

        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;

        default:
            throw error;
    }
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    log('start', 'Listening at ' + bind);
}

chat.installHandlers(server, {prefix:'/socket', log:function(){}});