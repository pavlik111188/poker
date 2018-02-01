var mongoose = require('mongoose');

var UserInChatSchema = new mongoose.Schema({
    room: String,
    email: String,
    name: String,
    chair: String,
    position: Array
});

module.exports = mongoose.model('UserInChat', UserInChatSchema);
