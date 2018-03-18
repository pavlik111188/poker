var mongoose = require('mongoose');

var UserInChatSchema = new mongoose.Schema({
    room: String,
    email: String,
    name: String,
    chair: String,
    chair_number: Number,
    position: Array,
    finished: Boolean,
    userCards: { type: Array, default: [] }
});

module.exports = mongoose.model('UserInChat', UserInChatSchema);
