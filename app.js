const Discord = require('discord.js');
const bot = new Discord.Client();
const keys = require('./keys.js');

let botStartTime;

bot.on('ready', () => {
    botStartTime = new Date();
});

bot.on('message', message => {

});

bot.login(keys.discord_bot_token);