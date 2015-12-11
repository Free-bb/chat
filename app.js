/* Requires */
var s = require('underscore.string');
var express = require('express');
var config = require('./config.json');
var utils = require('./lib/utils.js');
var path = require('path');
var pack = require('./package.json');
var log = require('./lib/log.js');


/* Express */
var app = express();
app.set('port', 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/* Variables */
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

var http = require('http').Server(app);
var io = require('socket.io')(http);



io.use(function(socket, next){
    console.log("userInfo: ", socket.handshake.query);
    // return the result of next() to accept the connection.
    if (socket.handshake.query.foo == "bar") {
        return next();
    }
    // call next() with an Error if you need to reject the connection.
    next(new Error('Authentication error'));
});


io.on('connection', function(socket){
    socket.on('message', function(msg){
        io.emit('message', msg);
    });
});



http.listen(3000, function(){
    console.log('listening on *:3000');
});


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