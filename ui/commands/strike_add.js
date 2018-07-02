const strikeService = new (require('../../service/StrikeService.js'));

module.exports = {
    execute: function(userCommand) {
        let guild = userCommand.message.guild;
        let regex = /[^<]+\<@[\!]{0,1}([0-9]+)\>\s*(.*)/;
        if (!regex.test(userCommand.content)) {
            userCommand.message.channel.send('Incorrect syntax, example: strike add @User Advertising other competetive organisations.');
            return;
        }
        let match = regex.exec(userCommand.content);
        let userId = match[1];
        let reason = match[2];
        let memberToStrike = null;
        guild.members.forEach(member => {
            if (member.id === userId) memberToStrike = member;
        });
        if (memberToStrike === null) {
            userCommand.message.channel.send('This user does not exist.');
            return;
        }
        strikeService.getStrikes(userId, (strikes) => {
            let size = strikes.length + 1;
            if (size > 3) return;
            strikeService.addStrike(userId, reason, new Date(), () => {
                if (size >= 3) {
                    if (!memberToStrike.bannable) {
                        userCommand.message.channel.send('<@' + userId + '> has retrieved 3 strikes, but I do not have permissions to ban this user.');
                        return;
                    }
                    memberToStrike.ban('You have retrieved 3 strikes, which results in this ban.');
                    userCommand.message.channel.send('<@' + userId + '> has been banned due to retrieving 3 strikes.');
                    return;
                }
                userCommand.message.channel.send('<@' + userId + '>, you are on ' + size + ' strike' + (size > 1 ? 's' : '') + '. Reason: ' + reason);
            });
        });
    }
}