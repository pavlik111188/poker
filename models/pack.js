var mongoose = require('mongoose');

var PackSchema = new mongoose.Schema({
    game: String,
    room: String,
    cards: String
});

module.exports = mongoose.model('Pack', PackSchema);
