const util = require('util');
const config = require('../config.js');
const fs = require('fs');

let path;
let guilds = [];

function log(obj) {
    logMessage(util.inspect(obj), 'LOG');
    if (config.logger.on_log_discord_message) {
        sendDiscordLog(obj, 'LOG');
    }
}

function logWarning(obj) {
    logMessage(util.inspect(obj), 'WARNING');
    if (config.logger.on_log_discord_message) {
        sendDiscordLog(obj, 'WARNING');
    }
}

function logError(obj) {
    logMessage(util.inspect(obj), 'ERROR');
    if (config.logger.on_log_discord_message) {
        sendDiscordLog(obj, 'ERROR');
    }
}

function logErrorObject(obj) {
    logError(util.inspect(obj));
    if (config.logger.on_log_discord_message) {
        sendDiscordLog(obj, 'ERROR');
    }
}

function logMessage(string, prefix) {
    let now = new Date();
    let msg = '[' + dateFormat(now, "%d/%m/%Y %H:%M:%S", false) + ']';
    msg += '[' + prefix + ']' + ' ' + string;
    if (config.logger.log_to_console) console.log(msg);
    if (config.logger.log_to_file) {
        if (path === undefined || path === null) {
            console.log("-------- WARNING: Could not log to file: No root path specified.");
            return;
        }
        if (!fs.existsSync(getFileDirectory())){
            fs.mkdirSync(getFileDirectory());
        }
        let write = () => {
            fs.appendFileSync(getFileLocation(), msg + '\r\n', function(err) {
                if(err) {
                    console.log("Could not write to log file, error:");
                    console.log(err);
                    return;
                }
            });
        };
        if (!fs.existsSync(getFileLocation())) {
            fs.writeFile(getFileLocation(), "", function(err) {
                if(err) {
                    console.log("Could not create log file, error:");
                    console.log(err);
                    return;
                }
                write();
            }); 
        } else { write(); }
    }
}

function sendDiscordLog(obj, logType) {
        guilds.forEach(guild => {
            guild.channels.array().forEach(channel => {
                if (channel.type !== 'text') return;
                config.logger.discord_log_channel_ids.forEach(id => {
                    if (id === channel.id) {
                        channel.send('[' + logType + '] ' + util.inspect(obj));
                    }
                });
            });
        });
}

function getFileLocation() {
    return getFileDirectory() + config.logger.log_file_name;
}

function getFileDirectory() {
    return path + (path.charAt(path.length-1) === '/' ? '' : '/') + config.logger.log_file_directory + (config.logger.log_file_directory.charAt(config.logger.log_file_directory.length-1) === '/' ? '' : '/');
}

function dateFormat (date, fstr, utc) {
    utc = utc ? 'getUTC' : 'get';
    return fstr.replace (/%[YmdHMS]/g, function (m) {
        switch (m) {
        case '%Y': return date[utc + 'FullYear'] (); // no leading zeros required
        case '%m': m = 1 + date[utc + 'Month'] (); break;
        case '%d': m = date[utc + 'Date'] (); break;
        case '%H': m = date[utc + 'Hours'] (); break;
        case '%M': m = date[utc + 'Minutes'] (); break;
        case '%S': m = date[utc + 'Seconds'] (); break;
        default: return m.slice (1); // unknown code, remove %
        }
        // add leading zero if required
        return ('0' + m).slice (-2);
    });
}

module.exports = {
    log,
    logWarning,
    logError,
    logErrorObject,
    setPath: function(p) {
        path = p;
    },
    setGuilds: function(g) {
        guilds = g;
    },
    objToString: function(obj) {
        return util.inspect(obj);
    }
};