const Discord = require('discord.js');
const bot = new Discord.Client();
const env = require('./env.js');
const RestockChecker = require('./ui/RestockChecker.js');
const logService = require('./service/LogService.js');
const databaseConnection = require('./database/DatabaseConnection.js');
const DatabaseType = require('./database/DatabaseType.js');
const commandManager = new (require('./ui/CommandManager.js'));
const config = require('./config.js');

let botStartTime;
let onReadyCallbacks = [];
let reconnectInterval;

process.on('uncaughtException', function(err) {
    logService.logErrorObject(err);
    tryReconnect();
});

bot.on('error', (error) => {
    tryReconnect();
});

function tryReconnect() {
    if (reconnectInterval !== undefined && reconnectInterval !== null) return;
    logService.logWarning('Disconnected, trying to reconnect...');
    let timeout;
    reconnectInterval = setInterval(() => {
        login(() => {
            clearTimeout(timeout);
            clearInterval(reconnectInterval);
            timeout = null;
            reconnectInterval = null;
        });
    }, 2000);
    timeout = setTimeout(() => { 
        clearInterval(reconnectInterval);
        logService.logError('Could not reconnect within 5 minutes, quiting...');
        process.exit(1);
    }, 300000);
}

bot.on('ready', () => {
    onReadyCallbacks.forEach(cb => { cb(); });
    onReadyCallbacks = [];
    try {
        logService.setPath(__dirname);
        logService.setGuilds(bot.guilds.array());
        botStartTime = new Date();
        logService.log("Bot launched successfully...");
        databaseConnection.connect(() => {
            try {
                let restockChecker = new RestockChecker(bot, botStartTime);
                restockChecker.start();
            } catch (err) {
                logService.logErrorObject(err);
            }
        });
    } catch (err) {
        logService.logErrorObject(err);
    }
});

bot.on('message', message => {
    try {
        if (message.content.trim().charAt(0) !== config.prefix) return;
        if (!commandManager.isCommand(message.content)) return;
        if (message.guild === undefined || message.guild === null) return;
        commandManager.execute(message.content, message);
    } catch (err) {
        logService.logErrorObject(err);
    }
});

function login(cb) {
    if (cb !== undefined && cb !== null) onReadyCallbacks.push(cb);
    try {
        bot.login(env.discord_bot_token);
    } catch (err) {
        logService.logErrorObject(err);
    }
}

login();