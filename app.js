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
var nbmsg   = 10;

/* MySQL */
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'lastimport'
});

/* Express */
var app = express();
app.set('port', port);
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
    // userInformation = JSON.parse(socket.handshake.query.userInfo);
    // if (!userInformation.uid) {
    //     next(new Error('Authentication error'));
    // }
    // clients[userInformation.uid] = userInformation;
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
            'user': clients[msg.user.uid],
            'time': new Date()
        }));
        saveMessage(msg);
    });

    socket.on('init', function(content){
        infoInit    = JSON.parse(content);
        channelName = 'init' + infoInit.uid;
        channelId   = infoInit.channelId;

        messages = getMessages(channelId, channelName);
    });

    socket.on('newnotification', function(infos){
        io.emit('newnotification' + infos.channelId, JSON.stringify(infos));
    });

    socket.on('personalNotification', function(infos){
        io.emit('personalNotification' + infos.uid, JSON.stringify(infos));
    });
});

function getMessages(channelId, channelName){
    connection.query('SELECT sf_chat.channel_id, sf_chat.user_id, sf_chat.message, sf_chat.time, fos_user.username, fos_user.avatar FROM sf_chat LEFT JOIN fos_user ON (sf_chat.user_id = fos_user.id) WHERE `channel_id` = "'+ channelId +'" ORDER BY time DESC LIMIT 0, 10', function (error, results, fields) {
        results = results.reverse();
        for (var i = 0, len = results.length; i < len; i++) {
            io.emit(channelName, JSON.stringify({
                'msg': results[i].message,
                'user': {'uid': results[i].user_id, 'avatar': results[i].avatar, 'username': results[i].username},
                'time': results[i].time
            }));
        }
    });
}

function saveMessage(msg){
    connection.query('INSERT INTO sf_chat SET ?', {
        channel_id: msg.user.channelId,
        user_id: msg.user.uid,
        message: msg.msg,
        time: new Date()
    }, function(err, result) {
      if (err) throw err;
    });
}

http.listen(port, function(){
    console.log('listening on *:' + port);
});