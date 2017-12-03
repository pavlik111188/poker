/**
 * Created by Pavel S on 06.06.17.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// set up a mongoose model
var RolesSchema = new Schema({
    role: {
        type: String,
        unique: true
    }
});

module.exports = mongoose.model('Role', RolesSchema);