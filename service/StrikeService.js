const StrikeDao = require('../database/strike/StrikeDao.js');

module.exports = class StrikeService {
    constructor() {
        this.strikeDao = new StrikeDao();
    }

    getStrikes(userId, callback) {
        this.strikeDao.getStrikes(userId, callback);
    }

    // callback(err, strike)
    addStrike(userId, reason, timestamp, callback) {
        this.strikeDao.addStrike(userId, reason, timestamp, callback);
    }

    // callback(err)
    removeStrike(userId, index, callback) {
        this.strikeDao.removeStrike(userId, index, callback);
    }
}