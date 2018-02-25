var mongoose = require('mongoose');
const uniqueArrayPlugin = require('mongoose-unique-array');
var UserCardsSchema = new mongoose.Schema({
    game: String,
    table: String,
    user: String,
    cards: {type: Array, unique: true}
});
UserCardsSchema.plugin(uniqueArrayPlugin);
module.exports = mongoose.model('UserCards', UserCardsSchema);
