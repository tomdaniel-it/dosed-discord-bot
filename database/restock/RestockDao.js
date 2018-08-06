const MessageModelMongo = require('./MessageModelMongo.js');
const DatabaseType = require('../DatabaseType.js');
const logService = require('../../service/LogService.js');
const MessageModelMySQL = require('./MessageModelMySQL.js');
const config = require('../../config.js');

function createDatabases(connection, callback) {
    if (config.database.type === DatabaseType.MYSQL) {
        connection.query('CREATE TABLE IF NOT EXISTS message (channel_id VARCHAR(255), id VARCHAR(255), timestamp VARCHAR(255));', (error) => {
            if (error) {
                logService.logErrorObject(err);
                return;
            }
            callback();
        });
    }
}

function addMessageId(channelId, id, timestamp) {
    if (config.database.type === DatabaseType.MONGODB) {
        try {
            let message = new MessageModelMongo({ channel_id: channelId.toString(), id: id.toString(), timestamp: timestamp });
            message.save();
        } catch (err) {
            logService.logErrorObject(err);
        }
    } else if (config.database.type === DatabaseType.MYSQL) {
        MessageModelMySQL.add(channelId, id.toString(), timestamp);
    }
}

function getMessageIds(channelId, callback) {
    if (callback === undefined || callback === null) callback = function() {};
    if (config.database.type === DatabaseType.MONGODB) {
        try {
            MessageModelMongo.find({}, ['channel_id', 'id', 'timestamp'], {
                skip: 0,
                sort: {
                    timestamp: -1
                }
            }, (err, messages) => {
                if (err) {
                    logService.logErrorObject(err);
                    return;
                }
                let result = [];
                messages.forEach(message => { if (message.channel_id === channelId) result.push(message); });
                callback(result);
            });
        } catch (err) {
            logService.logErrorObject(err);
        }
    } else if (config.database.type === DatabaseType.MYSQL) {
        MessageModelMySQL.findByChannelId(channelId, callback);
    }
}

function removeMessageIds(channelId, ids) {
    if (config.database.type === DatabaseType.MONGODB) {
        try {
            ids.forEach(id => {
                MessageModelMongo.where('channel_id', channelId).and('id', id).remove();
            });
        } catch (err) {
            logService.logErrorObject(err);
        }
    } else if (config.database.type === DatabaseType.MYSQL) {
        ids.forEach(id => {
            MessageModelMySQL.remove(id);
        });
    }
}

module.exports = {
    createDatabases,
    addMessageId,
    getMessageIds,
    removeMessageIds,    
}