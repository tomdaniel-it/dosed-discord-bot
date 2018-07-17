const config = require('../config.js');
const UserCommand = require('../domain/UserCommand.js');
const logService = require('../service/LogService.js');

module.exports = class CommandManager {
    isCommand(command) {
        command = command.trim();
        return this.getCommand(command) !== null;
    }

    getCommand(command) {
        try {
            command = command.trim();
            let result = null;
            config.commands.forEach(cmd => {
                if (command.substring(1).startsWith(cmd.name)) {
                    result = JSON.parse(JSON.stringify(cmd));
                }
            });
            return result;
        } catch (err) {
            logService.logErrorObject(err);
        }
    }

    execute(command, message) {
        try {
            command = command.trim();
            let cmd = this.getCommand(command);
            if (cmd === null) return;
            let userCommand = this.transformToUserCommand(message);
            if (!this.checkPermissions(userCommand)) return;
            require('./commands/' + cmd.file_name).execute(userCommand);
        } catch (err) {
            logService.logErrorObject(err);
        }
    }

    checkPermissions(userCommand) {
        try {
            let content = userCommand.content.trim();
            let command = this.getCommand(config.prefix + content);
            if (command === null) return false;
            let result = false;
            userCommand.message.member.roles.forEach(role => {
                if (command.roles === undefined || command.roles === null) { result = true; return; }
                if (command.roles.indexOf(role.name) !== -1) result = true;
            });
            return result;
        } catch (err) {
            logService.logErrorObject(err);
        }
    }

    transformToUserCommand(message) {
        try {
            return new UserCommand(message);
        } catch (err) {
            logService.logErrorObject(err);
        }
    }
}