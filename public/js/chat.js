var userInfo;
var blop = new Audio('sounds/blop.wav');
var channelId;
var regex = /(&zwj;|&nbsp;)/g;

var userInfo = {
    username: 'Thomas',
    uid: 1,
    avatar: 'http://forum.free-bb.com/upload/75/d5/8b/a7/46/75d58ba746274bfed477bb23e6e744bcbdc99dd2.jpeg'
};

var socket = io('', { query: "userInfo=" + JSON.stringify(userInfo) });

socket.on('message', function(content){
    data = JSON.parse(content);
    addMessage(data.type, data.user, data.message)
});


/* Functions */
function sendSocket(value, type, extra) {
    socket.send(JSON.stringify({
        channelId: channelId,
        type: type,
        message: value,
        extra: extra
    }));
}

function openUser(channelId, userInfo) {
    socket.send(JSON.stringify({
        channelId: channelId,
        user:      userInfo,
        type:      'open'
    }));
}

function handleInput() {
    var value = $('#btn-chat-input').val().replace(regex, ' ').trim();
    socket.emit('message', value);
    $('#btn-chat-input').val('');
}

function addMessage(type, user, message) {
    content  = '<div class="media">';
    content += '<div class="media-left pull-left"><a href="#"><img class="media-object" src="' + user.avatar + '" alt="" style="width:24px;height:24px;"></a></div>';
    content += '<div class="media-body">' + message + '</div>';
    content += '</div>';

    blop.play();

    $('#chatList').append(content);
    $('#chatList').animate({scrollTop: $('#chatList').prop('scrollHeight')}, 500);
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
});