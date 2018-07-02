const strikeService = new (require('../../service/StrikeService.js'));
const logService = require('../../service/LogService.js');

module.exports = {
    execute: function(userCommand) {
        let guild = userCommand.message.guild;
        let regex = /^[^<]+\<@[\!]{0,1}([0-9]+)\>.*$/;
        if (!regex.test(userCommand.content)) {
            userCommand.message.channel.send('Incorrect syntax, example: strike see @User.');
            return;
        }
        let match = regex.exec(userCommand.content);
        let userId = match[1];
        strikeService.getStrikes(userId, (strikes) => {
            if (strikes.length === 0) {
                userCommand.message.channel.send('That user does not have any strikes.');
                return;
            }
            let msg = 'Strikes of <@' + userId + '>:\n```\n';
            for (let i = 0; i < strikes.length; ++i) {
                msg += (i + 1) + '. Reason: ' + (strikes[i].reason.trim().length === 0 ? 'No reason' : strikes[i].reason.trim()) + ', Time: ' + strikes[i].timestamp + '\n';
            }
            msg += '```';
            userCommand.message.channel.send(msg);
        });
    }
}