let databaseConnection = require('../DatabaseConnection.js');
const logService = require('../../service/LogService.js');

module.exports = {
    add: function (channelId, id, timestamp) {
        timestamp = timestamp.toISOString();
        databaseConnection.getMySQLConnection((connection) => {
            connection.query('INSERT INTO message (channel_id, id, timestamp) VALUES (?, ?, ?)', [channelId, id, timestamp], (error) => {
                if (error) {
                    logService.logErrorObject(error);
                    return;
                }
            });
        });
    },
    findByChannelId: function (channelId, callback) {
        // ORDER BY TIMESTAMP
        databaseConnection.getMySQLConnection((connection) => {
            connection.query('SELECT * FROM message WHERE channel_id = ? ORDER BY timestamp ASC', [channelId], (error, rows) => {
                if (error) {
                    logService.logErrorObject(error);
                    return;
                }
                let result = [];
                rows.forEach(row => {
                    result.push({ channel_id: row.channel_id, id: row.id, timestamp: new Date(row.timestamp) });
                });
                callback(result);
            });
        });
    },
    remove: function (id) {
        databaseConnection.getMySQLConnection((connection) => {
            connection.query('DELETE FROM message WHERE id = ?', [id], (error) => {
                if (error) {
                    logService.logErrorObject(error);
                    return;
                }
            });
        });
    }
};