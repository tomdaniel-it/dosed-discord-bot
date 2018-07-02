const strikeService = new (require('../../service/StrikeService.js'));
const logService = require('../../service/LogService.js');

module.exports = {
    execute: function(userCommand) {
        try {
            strikeService.getStrikes(userCommand.author.id, (strikes) => {
                try {
                    userCommand.message.channel.send('You have ' + strikes.length + ' strike' + (strikes.length !== 1 ? 's' : '') + '.');
                } catch (err) {
                    logService.logError(logService.objToString(err));
                }
            });
        } catch (err) {
            logService.logError(logService.objToString(err));
        }
    }
}