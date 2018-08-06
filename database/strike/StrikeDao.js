const StrikeModelMongo = require('./StrikeModelMongo.js');
const StrikeModelMySQL = require('./StrikeModelMySQL.js');
const DatabaseType = require('../DatabaseType.js');
const logService = require('../../service/LogService.js');
const config = require('../../config.js');

function createDatabases(connection, callback) {
    if (config.database.type === DatabaseType.MYSQL) {
        connection.query('CREATE TABLE IF NOT EXISTS strike (user_id VARCHAR(255), reason VARCHAR(255), timestamp VARCHAR(255));', (error) => {
            if (error) {
                logService.logErrorObject(err);
                return;
            }
            callback();
        });
    }
}

function addStrike(userId, reason, timestamp, callback) {
    if (callback === undefined || callback === null) callback = function() {};
    if (config.database.type === DatabaseType.MONGODB) {
        try {
            let strike = new StrikeModelMongo({ user_id: userId, reason, timestamp });
            strike.save(callback);
        } catch (err) {
            logService.logErrorObject(err);
        }
    } else if (config.database.type === DatabaseType.MYSQL) {
        StrikeModelMySQL.add(userId, reason, timestamp, callback);
    }
}

function getStrikes(userId, callback) {
    if (callback === undefined || callback === null) callback = function() {};
    if (config.database.type === DatabaseType.MONGODB) {
        try {
            StrikeModelMongo.find({ user_id: userId }, ['user_id', 'reason', 'timestamp'], {sort: { timestamp: 1 }}, (err, strikes) => {
                callback(strikes);
            });
        } catch (err) {
            logService.logErrorObject(err);
        }
    } else if (config.database.type === DatabaseType.MYSQL) {
        StrikeModelMySQL.findByUserId(userId, callback);
    }
}

function removeStrike(userId, index, callback) {
    if (callback === undefined || callback === null) callback = function() {};
    if (config.database.type === DatabaseType.MONGODB) {
        try {
            this.getStrikes(userId, strikes => {
                if (index >= strikes.length) {
                    callback(new Error("Index in strike array out of bounds."), null);
                }
                strikes[index].remove();
                callback();
            });
        } catch (err) {
            logService.logErrorObject(err);
        }
    } else if (config.database.type === DatabaseType.MYSQL) {
        try {
            this.getStrikes(userId, strikes => {
                if (index >= strikes.length) {
                    callback(new Error("Index in strike array out of bounds."), null);
                }
                StrikeModelMySQL.remove(strikes[index].timestamp, callback);
            });
        } catch (err) {
            logService.logErrorObject(err);
        }
    }
}

module.exports = {
    createDatabases,
    addStrike,
    getStrikes,
    removeStrike,
}