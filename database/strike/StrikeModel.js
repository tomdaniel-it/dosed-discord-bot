const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StrikeSchema = new Schema({
    user_id: String,
    reason: String,
    timestamp: Date
});

const Strike = mongoose.model('strike', StrikeSchema);

module.exports = Strike;