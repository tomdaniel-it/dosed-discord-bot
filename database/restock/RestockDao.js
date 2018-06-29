const Message = require('./MessageModel.js');
const DatabaseConnection = require('../DatabaseConnection.js');

let db = (new DatabaseConnection()).getDb();

module.exports = class RestockDao {
    addMessageId(channelId, id, timestamp) {
        let message = new Message({ channel_id: channelId.toString(), id: id.toString(), timestamp: timestamp });
        message.save();
    }

    getMessageIds(channelId, callback) {
        Message.find({}, ['channel_id', 'id', 'timestamp'], {
            skip: 0,
            sort: {
                timestamp: -1
            }
        }, (err, messages) => {
            let result = [];
            messages.forEach(message => { if (message.channel_id === channelId) result.push(message); });
            callback(result);
        });
    }

    removeMessageIds(channelId, ids) {
        ids.forEach(id => {
            Message.where('channel_id', channelId).and('id', id).remove();
        });
    }
}