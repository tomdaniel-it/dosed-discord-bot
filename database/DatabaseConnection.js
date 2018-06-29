const mongoose = require('mongoose');
const logService = require('../service/LogService.js');

let db;

module.exports = class DatabaseConnection {
    connect(callback) {
        mongoose.Promise = global.Promise;
        mongoose.connect('mongodb://localhost/bot');
        db = mongoose.connection;
        mongoose.connection.once('open', callback).on('error', error => {
            logService.logError('Mongodb connection error => ' + logService.objToString(error));
        });
    }

    getDb() {
        return db;
    }
}