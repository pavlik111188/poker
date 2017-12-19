var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

// set up a mongoose model
var TableSchema = new Schema({
    name: {
        type: String,
        unique: false,
        required: true
    },
    ownerEmail: {
        type: String,
        unique: false,
        required: true
    }
});

module.exports = mongoose.model('Table', TableSchema);