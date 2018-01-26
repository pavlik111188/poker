var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var Chat = require('../models/chat.js');
var Message = require('../models/message.js');
var User = require('../models/user.js');
var UserInChat = require('../models/user_in_chat.js');
var clients = [];
const passport	= require('passport');
const jwt       = require('jwt-simple');

server.listen(4000);

// socket io
io.on('connection', function (socket) {
  console.log('User connected');
  socket.on('room', function(room) {
      if (room.name) {
          socket.join(room.name);
          console.log('room: ', room);
          io.emit('join', {status: 'success'});
      }
  });
  socket.on('disconnect', function(data) {
    console.log('User disconnected ', data);
  });
  socket.on('save-message', function (data) {
      console.log('save-message ', data);
    io.emit('new-message', { message: data });
  });

});

module.exports = router;
