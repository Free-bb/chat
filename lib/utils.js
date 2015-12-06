/* Exports */
module.exports = {
    sendToAll: function(channelId, clients, data) {
        for(var client in clients) {
            if(clients[client].role > 1 && (data.info === 'connection' || data.info === 'disconnection')) {
                data.user.ip = module.exports.getUserByID(clients, data.user.id).ip;
            } else if(data.user) {
                delete data.user.ip;
            }

            clients[client].con.write(JSON.stringify(data));
        }
    },

    sendBack: function(clients, data, user) {
        clients[user.con.id].con.write(JSON.stringify(data));
    },

    checkUser: function(clients, user) {
        for(var client in clients) {
            if(clients[client].un === user) {
                return true;
            }
        }
        return false;
    },

    getUserByName: function(clients, name) {
        for(client in clients) {
            if(clients[client].un === name) {
                return clients[client];
            }
        }
    },

    getUserByID: function(clients, id) {
        for(client in clients) {
            if(clients[client].id === id) {
                return clients[client];
            }
        }
    },

    normalizePort: function(val) {
        var port = parseInt(val, 10);

        if(isNaN(port)) {
            return val;
        }

        if(port >= 0) {
            return port;
        }

        return false;
    }
}