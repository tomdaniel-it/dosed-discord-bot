const Discord = require('discord.js');
const bot = new Discord.Client();
const keys = require('./keys.js');
const RestockChecker = require('./ui/RestockChecker.js');

let botStartTime;

bot.on('ready', () => {
    botStartTime = new Date();
    let restockChecker = new RestockChecker(bot, botStartTime);
    restockChecker.start();
});

bot.on('message', message => {

});

bot.login(keys.discord_bot_token);