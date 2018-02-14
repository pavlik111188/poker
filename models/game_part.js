var mongoose = require('mongoose');

var GamePartSchema = new mongoose.Schema({
    part: Number,
    game: String,
    room: String,
    turns: [{
        user: String,
        card: String,
        whom: String,
        move_type: String
    }],
    ended: Boolean
});

module.exports = mongoose.model('GamePart', GamePartSchema);
