const StrikeDao = require('../database/strike/StrikeDao.js');

module.exports = class StrikeService {
    constructor() {
        this.strikeDao = new StrikeDao();
    }

    getStrikes(userId, callback) {
        try {
            if (callback === undefined || callback === null) callback = function() {};
            this.strikeDao.getStrikes(userId, callback);
        } catch (err) {
            logService.logErrorObject(err);
        }
    }

    // callback(err, strike)
    addStrike(userId, reason, timestamp, callback) {
        try {
            if (callback === undefined || callback === null) callback = function() {};
            this.strikeDao.addStrike(userId, reason, timestamp, callback);
        } catch (err) {
            logService.logErrorObject(err);
        }
    }

    // callback(err)
    removeStrike(userId, index, callback) {
        try {
            if (callback === undefined || callback === null) callback = function() {};
            this.strikeDao.removeStrike(userId, index, callback);
        } catch (err) {
            logService.logErrorObject(err);
        }
    }
}