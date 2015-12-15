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
var messages = [];

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
    return next();
});


io.on('connection', function(socket){
    socket.on('newmessage', function(content){
        msg = JSON.parse(content);

        channelId = msg.channelId;
        channelName = 'message' + channelId;
        io.emit(channelName, JSON.stringify({
            'msg': msg.message,
            'user': clients[msg.user.uid]
        }));

        if (!messages[channelId]) {
            messages[channelId] = [];
        }

        messages[channelId].push([msg]);
    });

    socket.on('init', function(channelId){
        channelName = 'message' + channelId;

        if (messages[channelId]) {
            lastMessages = messages[channelId].slice(Math.max(messages[channelId].length - 5, 1));
            for (var i = 0, len = lastMessages.length; i < len; i++) {
                io.emit(channelName, lastMessages[i]);
            }
        }
    });
});









http.listen(3000, function(){
    console.log('listening on *:3000');
});