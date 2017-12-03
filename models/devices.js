var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// set up a mongoose model
var DevicesSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    group: {
        type: String,
        required: true,
        default: 0
    }
});


module.exports = mongoose.model('Devices', DevicesSchema);