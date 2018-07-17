const Message = require('./MessageModel.js');
const DatabaseConnection = require('../DatabaseConnection.js');
const logService = require('../../service/LogService.js');

let db = (new DatabaseConnection()).getDb();

module.exports = class RestockDao {
    addMessageId(channelId, id, timestamp) {
        try {
            let message = new Message({ channel_id: channelId.toString(), id: id.toString(), timestamp: timestamp });
            message.save();
        } catch (err) {
            logService.logErrorObject(err);
        }
    }

    getMessageIds(channelId, callback) {
        try {
            if (callback === undefined || callback === null) callback = function() {};
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
        } catch (err) {
            logService.logErrorObject(err);
        }
    }

    removeMessageIds(channelId, ids) {
        try {
            ids.forEach(id => {
                Message.where('channel_id', channelId).and('id', id).remove();
            });
        } catch (err) {
            logService.logErrorObject(err);
        }
    }
}