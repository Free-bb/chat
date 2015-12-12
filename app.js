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