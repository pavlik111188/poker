var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

// set up a mongoose model
var ChairSchema = new Schema({
    top: {
        type: String,
        unique: false,
        required: true
    },
    left: {
        type: String,
        unique: false,
        required: true
    }
});

module.exports = mongoose.model('Chair', ChairSchema);
