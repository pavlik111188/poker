var mongoose = require('mongoose');

var ChatSchema = new mongoose.Schema({
  room: String,
  title: String
});

module.exports = mongoose.model('Chat', ChatSchema);
