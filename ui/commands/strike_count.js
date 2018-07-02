const strikeService = new (require('../../service/StrikeService.js'));
const logService = require('../../service/LogService.js');

module.exports = {
    execute: function(userCommand) {
        strikeService.getStrikes(userCommand.author.id, (strikes) => {
            userCommand.message.channel.send('You have ' + strikes.length + ' strike' + (strikes.length !== 1 ? 's' : '') + '.');
        });
    }
}