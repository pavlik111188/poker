var mongoose = require('mongoose');

var StartedGameSchema = new mongoose.Schema({
    game: String,
    table: String,
    trump: String
});

module.exports = mongoose.model('StartedGame', StartedGameSchema);
