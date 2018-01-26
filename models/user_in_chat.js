var mongoose = require('mongoose');

var UserInChatSchema = new mongoose.Schema({
    room: String,
    email: String,
    chair: String
});

module.exports = mongoose.model('UserInChat', UserInChatSchema);
