const mongoose = require('mongoose');
const logService = require('../service/LogService.js');

let db;

module.exports = class DatabaseConnection {
    connect(callback) {
        try {
            if (callback === undefined || callback === null) callback = function() {};
            mongoose.Promise = global.Promise;
            mongoose.connect('mongodb://localhost/bot');
            db = mongoose.connection;
            mongoose.connection.once('open', callback).on('error', error => {
                logService.logError('Mongodb connection error => ' + logService.objToString(error));
            });
        } catch (err) {
            logService.logErrorObject(err);
        }
    }

    getDb() {
        return db;
    }
}