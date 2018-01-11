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
/*io.on('connection', function (socket) {
  console.log('User connected');
  socket.on('room', function(room) {
      socket.join(room);
      console.log('room: ', room);
  });
  socket.on('disconnect', function(data) {
    console.log('User disconnected ', data);
  });
  socket.on('save-message', function (data) {
      console.log('save-message ', data);
    io.emit('new-message', { message: data });
  });

});*/


// Chatroom

var numUsers = 0;

io.on('connection', function (socket) {
    var addedUser = false;

    socket.on('save-message', function (data) {
        io.emit('new-message', { message: data });
    });

    // when the client emits 'new message', this listens and executes
    /*socket.on('new message', function (data) {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });*/

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
        if (addedUser) return;
        socket.username = username;
        addUserToChat(username);
        ++numUsers;
        addedUser = true;
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function (username) {
        if (addedUser) {
            --numUsers;
            // console.log('disconnect ', socket.username);

            removeFromChat(socket.username);
            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});

/* Get messages by room */
router.post('/get_messages', function(req, res, next) {
    var room = req.body.room;
    Chat.findOne({
        room: room
    }, function(err, chat) {
        if (err) throw err;
        if (chat != null) {
          Message.find({ room: room }, function (err, messages) {
              if (err) return next(err);
              res.json(messages);
          });
        } else {
          Chat.create(req.body, function (err, post) {
              if (err) return next(err);
              // res.json(post);
              Message.find({ room: room }, function (err, messages) {
                  if (err) return next(err);
                  res.json(messages);
              });
          });
        }
    });
});

router.get('/get_users_in_chat', passport.authenticate('jwt', { session: false}), function(req, res, next) {
    UserInChat.find({
        room: req.query.room
    }, function(err, users) {
        if (err) throw err;
        if (res == null) {
            return res.status(403).send({success: false, msg: 'No users in this table'});
        } else {
            res.json({success: true, users: users});
        }
    });
})

/* SAVE CHAT */
router.post('/', function(req, res, next) {
  Message.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

function addUserToChat(data) {
    UserInChat.findOne({
        room: data.room,
        email: data.email
    }, function(err, res) {
        if (err) throw err;
        if (res == null) {
            UserInChat.create({
                room: data.room,
                email: data.email
            }, function (err, post) {
                if (err) return next(err);
                // res.json(post);
            });
        } else {
            clients.push(res._id.toString());
        }
    });
}

function removeFromChat(data) {
    UserInChat.findOne({
        room: data.room,
        email: data.email
    }, function(err, res) {
        if (err) throw err;
        if (clients.indexOf(res._id.toString()) > -1) {
            clients.splice(clients.indexOf(res._id.toString()), 1);
        } else {
            UserInChat.remove({
                room: data.room,
                email: data.email
            }, function (err, post) {
                if (err) return next(err);
                // res.json(post);
            });
        }
    });
}

//Token for user authorization
getToken = function (headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

module.exports = router;
