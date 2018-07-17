const Strike = require('./StrikeModel.js');
const DatabaseConnection = require('../DatabaseConnection.js');
const logService = require('../../service/LogService.js');

let db = (new DatabaseConnection()).getDb();

module.exports = class StrikeDao {
    addStrike(userId, reason, timestamp, callback) {
        try {
            if (callback === undefined || callback === null) callback = function() {};
            let strike = new Strike({ user_id: userId, reason, timestamp });
            strike.save(callback);
        } catch (err) {
            logService.logErrorObject(err);
        }
    }

    getStrikes(userId, callback) {
        try {
            if (callback === undefined || callback === null) callback = function() {};
            Strike.find({ user_id: userId }, ['user_id', 'reason', 'timestamp'], {sort: { timestamp: 1 }}, (err, strikes) => {
                callback(strikes);
            });
        } catch (err) {
            logService.logErrorObject(err);
        }
    }

    // callback(error)
    removeStrike(userId, index, callback) {
        try {
            if (callback === undefined || callback === null) callback = function() {};
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
    }
}