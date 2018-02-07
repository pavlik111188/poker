var mongoose = require('mongoose');

var TurnSchema = new mongoose.Schema({
    game: String,
    room: String,
    user: String,
    part_game: Number,
    card: String
});

module.exports = mongoose.model('Turn', TurnSchema);
