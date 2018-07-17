module.exports = class UserCommand {
    constructor(message) {
        this.message = message;
        this.author = message.author;
        if (content.length > 0) {
            this.content = message.content.trim().substring(1);
        } else {
            this.content = message.content.trim();
        }
    }
}