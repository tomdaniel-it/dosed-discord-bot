const Discord = require('discord.js');
const bot = new Discord.Client();
const keys = require('./keys.js');
const RestockChecker = require('./ui/RestockChecker.js');
const logService = require('./service/LogService.js');
const DatabaseConnection = require('./database/DatabaseConnection');

let botStartTime;

bot.on('ready', () => {
    try {
        logService.setPath(__dirname);
        botStartTime = new Date();
        logService.log("Bot launched successfully...");
        let databaseConnection = new DatabaseConnection();
        databaseConnection.connect(() => {
            let restockChecker = new RestockChecker(bot, botStartTime);
            restockChecker.start();
        });
    } catch (err) {
        logService.logError("app.js:21 => " + logService.objToString(err));
    }
});

bot.on('message', message => {

});

try {
    bot.login(keys.discord_bot_token);
} catch (err) {
    logService.logError("app.js:29 => " + logService.objToString(err));
}