/* Requires */
var s       = require('underscore.string');
var express = require('express');
var config  = require('./config.json');
var utils   = require('./lib/utils.js');
var path    = require('path');
var pack    = require('./package.json');
var log     = require('./lib/log.js');
var mysql   = require('mysql');
var port    = 3000;

/* MySQL */
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'me',
    password : 'secret',
    database : 'my_db'
});

/* Express */
var app = express();
app.set('port', port);
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
        msg.msg = s.escapeHTML(msg.msg);
        msg.user.id = s.escapeHTML(msg.user.id);
        msg.user.channelId = s.escapeHTML(msg.user.channelId);

        channelId = msg.user.channelId;
        channelName = 'message' + channelId;
        io.emit(channelName, JSON.stringify({
            'msg': msg.msg,
            'user': clients[msg.user.uid]
        }));
        // inti empty channel
        if (!messages[channelId]) {
            messages[channelId] = [];
        }
        messages[channelId].push([msg]);
    });

    socket.on('init', function(content){
        infoInit    = JSON.parse(content);
        channelName = 'init' + infoInit.uid;
        channelId   = infoInit.channelId;

        if (messages[channelId]) {
            lastMessages = messages[channelId].slice(Math.max(messages[channelId].length - 5, 1));
            for (var i = 0, len = lastMessages.length; i < len; i++) {
                io.emit(channelName, JSON.stringify(lastMessages[i][0]));
            }
        }
    });
});

function getMessages(channelId){
    connection.connect();
    connection.query('SELECT * FROM `books` WHERE `author` = "David"', function (error, results, fields) {
      // error will be an Error if one occurred during the query
      // results will contain the results of the query
      // fields will contain information about the returned results fields (if any)
    });
}

function saveMessage(){

}


http.listen(port, function(){
    console.log('listening on *:' + port);
});