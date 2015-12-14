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

/* Routes */
app.use(config.url, express.static(path.join(__dirname, 'public')));
app.get(config.url, function (req, res) {
    res.render('index', {version:pack.version});
});

var http = require('http').Server(app);
var io   = require('socket.io')(http);

io.use(function(socket, next){
    userInformation = JSON.parse(socket.handshake.query.userInfo);
    if (!userInformation.uid) {
        next(new Error('Authentication error'));
    }
    clients[userInformation.uid] = userInformation;
});










io.on('connection', function(socket){
    socket.on('newmessage', function(msg){
        channelName = 'message' + msg.channelId;
        io.emit(channelName, JSON.stringify({
            'msg': msg,
            'user': user
        }));
    });
});









http.listen(3000, function(){
    console.log('listening on *:3000');
});