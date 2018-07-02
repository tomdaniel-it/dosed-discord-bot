module.exports = class UserCommand {
    constructor(message) {
        this.message = message;
        this.author = message.author;
        this.content = message.content.trim().substring(1);
    }
}