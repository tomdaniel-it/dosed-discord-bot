let databaseConnection = require('../DatabaseConnection.js');
const logService = require('../../service/LogService.js');

module.exports = {
    add: function(userId, reason, timestamp, callback) {
        timestamp = timestamp.toISOString();
        databaseConnection.getMySQLConnection((connection) => {
            connection.query('INSERT INTO strike (user_id, reason, timestamp) VALUES (?, ?, ?)', [userId, reason, timestamp], (error) => {
                if (error) {
                    logService.logErrorObject(error);
                    return;
                }
                callback();
            });
        });
    },
    findByUserId: function(userId, callback) {
        databaseConnection.getMySQLConnection((connection) => {
            connection.query('SELECT * FROM strike WHERE user_id = ?', [userId], (error, rows) => {
                if (error) {
                    logService.logErrorObject(error);
                    return;
                }
                let result = [];
                rows.forEach(row => {
                    result.push({
                        user_id: row.user_id,
                        reason: row.reason,
                        timestamp: new Date(row.timestamp)
                    });
                });
                callback(result);
            });
        });
    },
    remove(timestamp, callback) {
        timestamp = timestamp.toISOString();
        databaseConnection.getMySQLConnection((connection) => {
            connection.query('DELETE FROM strike WHERE timestamp = ?', [timestamp], (error) => {
                if (error) {
                    logService.logErrorObject(error);
                    return;
                }
                callback();
            });
        });
    }
};