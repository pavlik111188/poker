var mongoose = require('mongoose');

var UserInChatSchema = new mongoose.Schema({
    room: String,
    email: String,
    name: String,
    chair: String,
    chair_number: Number,
    position: Array
});

module.exports = mongoose.model('UserInChat', UserInChatSchema);
