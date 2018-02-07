var mongoose = require('mongoose');

var GamePartSchema = new mongoose.Schema({
    part: Number,
    game: String,
    room: String,
    user: String,
    ended: Boolean
});

module.exports = mongoose.model('GamePart', GamePartSchema);
