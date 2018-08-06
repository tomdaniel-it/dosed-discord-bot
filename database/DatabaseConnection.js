const mongoose = require('mongoose');
const logService = require('../service/LogService.js');
const DatabaseType = require('./DatabaseType.js');
const mysql = require('mysql');
const env = require('../env.js');
const config = require('../config.js');

let mySQLConnection;
let mysqlConnectionRefreshInterval;
let mysqlConnectionAwaiters = [];
let mysqlConnecting = false;

function refreshMysqlConnection() {
    mysqlConnecting = true;
    let cb = () => {
        connect(() => {
            mysqlConnectionAwaiters.forEach((func) => { func(mySQLConnection); });
        }, false);
    };
    if (mySQLConnection !== undefined && mySQLConnection !== null) {
        mySQLConnection.end(() => {
            cb();
        });
    } else {
        cb();
    }
}

function connect(callback, init = true) {
    if (config.database.type === DatabaseType.MONGODB) {
        try {
            if (callback === undefined || callback === null) callback = function() {};
            mongoose.Promise = global.Promise;
            mongoose.connect('mongodb://localhost/bot');
            mongoose.connection.once('open', callback).on('error', error => {
                logService.logError('Mongodb connection error => ' + logService.objToString(error));
            });
        } catch (err) {
            logService.logErrorObject(err);
        }
    } else if (config.database.type === DatabaseType.MYSQL) {
        mySQLConnection = mysql.createConnection({
            host: env.database.mysql.host,
            user: env.database.mysql.user,
            password: env.database.mysql.password,
            database: env.database.mysql.database,
            port: env.database.mysql.port
        });
        mySQLConnection.connect(error => {
            if (error) {
                logService.logErrorObject(error);
                return;
            }
            if (!init) {
                callback();
                mysqlConnecting = false;
            } else {
                let restockDao = require('./restock/RestockDao.js');
                let strikeDao = require('./strike/StrikeDao.js');
                restockDao.createDatabases(mySQLConnection, () => {
                    strikeDao.createDatabases(mySQLConnection, () => { callback(); mysqlConnecting = false; });
                });
            }
        });
    }
}

function getMySQLConnection(callback) {
    if (mysqlConnectionRefreshInterval === null || mysqlConnectionRefreshInterval === undefined) {
        mysqlConnectionRefreshInterval = setInterval(refreshMysqlConnection, config.database.mysql.connection_refresh_time * 1000);
    }
    if (mysqlConnecting) {
        mysqlConnectionAwaiters.push(callback);
    } else {
        callback(mySQLConnection);
    }
}

module.exports = {
    connect,
    getMySQLConnection,
}