const config = require('../../config.js');

module.exports = {
    execute: function(userCommand) {
        let msg = "My commands: ```\n";
        config.commands.forEach(command => {
            msg += '- ' + command.description + '\n';
        });
        msg += '```';
        userCommand.message.channel.send(msg);
    }
}