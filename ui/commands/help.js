const config = require('../../config.js');
const logService = require('../../service/LogService.js');

module.exports = {
    execute: function(userCommand) {
        try {
            let msg = "My commands: ```\n";
            config.commands.forEach(command => {
                msg += '- ' + command.description + '\n';
            });
            msg += '```';
            userCommand.message.channel.send(msg);
        } catch (err) {
            logService.logError(logService.objToString(err));
        }
    }
}