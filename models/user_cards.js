var mongoose = require('mongoose');

var UserCardsSchema = new mongoose.Schema({
    game: String,
    table: String,
    user: String,
    cards: Array
});

module.exports = mongoose.model('UserCards', UserCardsSchema);
