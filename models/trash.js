var mongoose = require('mongoose');
const uniqueArrayPlugin = require('mongoose-unique-array');

var TrashSchema = new mongoose.Schema({
    room: String,
    cards: [{ type: String, unique: true }]
});
TrashSchema.plugin(uniqueArrayPlugin);
module.exports = mongoose.model('Trash', TrashSchema);
