const Discord = require('discord.js');
const bot = new Discord.Client();
const keys = require('./keys.js');
const RestockChecker = require('./ui/RestockChecker.js');
const logService = require('./service/LogService.js');

let botStartTime;

bot.on('ready', () => {
    try {
        botStartTime = new Date();
        console.log("Setting current path to " + __dirname);
        logService.setPath(__dirname);
        let restockChecker = new RestockChecker(bot, botStartTime);
        restockChecker.start();
        logService.log("Bot launched successfully...");
    } catch (err) {
        logService.logError("app.js:18 => " + logService.objToString(err));
    }
});

bot.on('message', message => {

});

try {
    bot.login(keys.discord_bot_token);
} catch (err) {
    logService.logError("app.js:29 => " + logService.objToString(err));
}