const Discord = require('discord.js');
const bot = new Discord.Client();
const keys = require('./keys.js');

bot.on('ready', () => {
    
});

bot.on('message', message => {

});

bot.login(keys.discord_bot_token);