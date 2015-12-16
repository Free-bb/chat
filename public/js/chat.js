var userInfo;
var blop = new Audio('sounds/blop.wav');
var channelId;
var regex = /(&zwj;|&nbsp;)/g;

var userInfo = {
    username: 'Thomas',
    uid: 1,
    avatar: 'http://forum.free-bb.com/upload/75/d5/8b/a7/46/75d58ba746274bfed477bb23e6e744bcbdc99dd2.jpeg',
    channelId: 1
};

var socket = io('', { query: "userInfo=" + JSON.stringify(userInfo) });

socket.on('message' + userInfo.channelId, function(content){
    data = JSON.parse(content);
    addMessage(data.msg, data.user);
});

socket.on('init' + userInfo.uid, function(content){
    data = JSON.parse(content);
    addMessage(data.msg, data.user);
});

/* Functions */
function handleInput() {
    var msg = $('#btn-chat-input').val().replace(regex, ' ').trim();

    socket.emit('newmessage', JSON.stringify({
        user: userInfo,
        msg: msg
    }));
    $('#btn-chat-input').val('');
}

function addMessage(message, user) {
    content  = '<div class="media">';
    content += '<div class="media-left pull-left"><a href="#"><img class="media-object" src="' + user.avatar + '" alt="" style="width:24px;height:24px;"></a></div>';
    content += '<div class="media-body">' + message + '</div>';
    content += '</div>';

    blop.play();
    $('#chatList').append(content);
    $('#chatList').animate({scrollTop: $('#chatList').prop('scrollHeight')}, 500);
}

function init() {
    socket.emit('init', JSON.stringify(userInfo));
}

/* Binds */
$(document).ready(function() {
    $('#btn-chat').bind('click', function() {
        handleInput();
    });

    $('#btn-chat-input').keypress(function(e) {
        if(e.which == 13) {
            handleInput();
        }
    });

    init();
});