var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
    room: String,
    nickname: String,
    message: String,
    updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', MessageSchema);
