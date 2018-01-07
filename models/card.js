var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

// set up a mongoose model
var CardSchema = new Schema({
    name: {
        type: String,
        unique: false,
        required: true
    },
    rank: {
        type: Number,
        unique: false,
        required: true
    },
    suit: {
        type: String,
        unique: false,
        required: true
    }
});

module.exports = mongoose.model('Card', CardSchema);
