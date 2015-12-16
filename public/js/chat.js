/* Config */
emojione.ascii = true;
emojione.imageType = 'png';
emojione.unicodeAlt = false;

FreebbChat = {
    userInfo: [],
    chatInputStringSelector: '#btn-chat-input',
    chatBtnStringSelector: '#btn-chat',
    chatListStringSelector: '#chatList',
    socket: null,
    regex: /(&zwj;|&nbsp;)/g,
    blop: new Audio('sounds/blop.wav'),

    addMessage: function(message, user) {
        _this = this;

        message = emojione.shortnameToImage(message);

        content  = '<div class="media">';
        content += '<div class="media-left pull-left"><a href="#"><img class="media-object" src="' + user.avatar + '" alt="" style="width:24px;height:24px;"></a></div>';
        content += '<div class="media-body">' + message + '</div>';
        content += '</div>';

        // remove notification sound if send is current user
        if (user.uid != _this.userInfo.uid) {
            _this.blop.play();
        }

        $(_this.chatListStringSelector).append(content);
        $(_this.chatListStringSelector).animate({scrollTop: $(_this.chatListStringSelector).prop('scrollHeight')}, 500);
    },

    handleInput: function() {
        _this = this;
        var msg = $(_this.chatInputStringSelector).val().replace(_this.regex, ' ').trim();

        _this.socket.emit('newmessage', JSON.stringify({
            user: _this.userInfo,
            msg: msg
        }));
        $(_this.chatInputStringSelector).val('');
    },

    bindInput: function(){
        _this = this;
        $(_this.chatBtnStringSelector).bind('click', function() {
            _this.handleInput();
        });

        $(_this.chatInputStringSelector).keypress(function(e) {
            if(e.which == 13) {
                _this.handleInput();
            }
        });
    },

    blockChat: function(){
        _this = this;
        $(_this.chatInputStringSelector).addClass('disabled').attr('disabled', 'disabled');
        $(_this.chatBtnStringSelector).addClass('disabled');
    },

    initSocket: function(){
        _this = this;
        _this.socket = io('', { query: "userInfo=" + JSON.stringify(_this.userInfo) });

        _this.socket.on('message' + userInfo.channelId, function(content){
            data = JSON.parse(content);
            _this.addMessage(data.msg, data.user);
        });

        _this.socket.on('init' + userInfo.uid, function(content){
            data = JSON.parse(content);
            _this.addMessage(data.msg, data.user);
        });
    },

    init: function(userInfo) {
        _this = this;
        _this.userInfo = userInfo;

        if (!userInfo.uid) {
            _this.blockChat();
        }

        _this.bindInput();
        _this.initSocket();
        _this.socket.emit('init', JSON.stringify(userInfo));
    }
}

var userInfo = {
    username: 'Thomas',
    uid: 1,
    avatar: 'http://forum.free-bb.com/upload/75/d5/8b/a7/46/75d58ba746274bfed477bb23e6e744bcbdc99dd2.jpeg',
    channelId: 1
};

$(document).ready(function() {
    FreebbChat.init(userInfo);
});