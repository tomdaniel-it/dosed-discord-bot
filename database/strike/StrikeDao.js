const Strike = require('./StrikeModel.js');
const DatabaseConnection = require('../DatabaseConnection.js');

let db = (new DatabaseConnection()).getDb();

module.exports = class StrikeDao {
    addStrike(userId, reason, timestamp, callback) {
        let strike = new Strike({ user_id: userId, reason, timestamp });
        strike.save(callback);
    }

    getStrikes(userId, callback) {
        Strike.find({ user_id: userId }, ['user_id', 'reason', 'timestamp'], {sort: { timestamp: 1 }}, (err, strikes) => {
            callback(strikes);
        });
    }

    // callback(error)
    removeStrike(userId, index, callback) {
        this.getStrikes(userId, strikes => {
            if (index >= strikes.length) {
                callback(new Error("Index in strike array out of bounds."), null);
            }
            strikes[index].remove();
            callback();
        });
    }
}