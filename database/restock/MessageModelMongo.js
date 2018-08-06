const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    channel_id: String,
    id: String,
    timestamp: Date
});

const Message = mongoose.model('message', MessageSchema);

module.exports = Message;