const strikeService = new (require('../../service/StrikeService.js'));
const logService = require('../../service/LogService.js');

module.exports = {
    execute: function(userCommand) {
        try {
            let guild = userCommand.message.guild;
            let regex = /^[^<]+\<@[\!]{0,1}([0-9]+)\>\s*([0-9]+)$/;
            if (!regex.test(userCommand.content)) {
                userCommand.message.channel.send('Incorrect syntax, example: strike remove @User 2 (removes 2nd strike of User).');
                return;
            }
            let match = regex.exec(userCommand.content);
            let userId = match[1];
            let index = parseInt(match[2]) - 1;
            strikeService.getStrikes(userId, (strikes) => {
                try {
                    if (index >= strikes.length || index < 0) {
                        userCommand.message.channel.send('You used an incorrect position.');
                        return;
                    }
                    if (strikes.length === 3) {
                        userCommand.message.guild.fetchBans().then(bans => {
                            try {
                                let user = bans.get(userId);
                                if (user !== null) userCommand.message.guild.unban(user);
                            } catch (err) {
                                logService.logError(logService.objToString(err));
                            }
                        });
                    }
                    strikeService.removeStrike(userId, index, (err) => {
                        try {
                            if (err) {
                                userCommand.message.channel.send('A database error has occured...');
                                logService.logError(logService.objToString(err));
                                return;
                            }
                            userCommand.message.channel.send('Strike has been removed.');
                        } catch (err) {
                            logService.logError(logService.objToString(err));
                        }
                    });
                } catch (err) {
                    logService.logError(logService.objToString(err));
                }
            });
        } catch (err) {
            logService.logError(logService.objToString(err));
        }
    }
}