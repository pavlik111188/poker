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

/*var numUsers = 0;

io.on('connection', function (socket) {
    var addedUser = false;

    //:JOIN:Client Supplied Room
    socket.on('subscribe',function(room){
        try{
            console.log('[socket]','join room :',room);
            console.log('user joined', socket.id);
            socket.join(room);
            socket.to(room).emit('user joined', socket.id);
        }catch(e){
            console.log('[error]','join room :',e);

            socket.emit('error','couldnt perform requested action');
        }
    });

    //:LEAVE:Client Supplied Room
    socket.on('unsubscribe',function(room){
        try{
            console.log('[socket]','leave room :', room);
            socket.leave(room);
            socket.to(room).emit('user left', socket.id);
        }catch(e){

            console.log('[error]','leave room :', e);
            socket.emit('error','couldnt perform requested action');
        }
    });

    socket.on('save-message', function (data) {
        io.emit('new-message', { message: data });
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
        if (addedUser) return;
        socket.username = username;
        addUserToChat(username);
        ++numUsers;
        addedUser = true;
        // echo globally (all clients) that a person has connected
        socket.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
        socket.to(socket.username.room).emit('event', 'content');
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
            socket.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});*/


// New socket io
// usernames which are currently connected to the chat
var usernames = {};

// rooms which are currently available in chat
var rooms = {};

var prevRoom = '';

var users = [];

io.sockets.on('connection', function (socket) {

    // socket.emit('connect');

    // when the client emits 'adduser', this listens and executes
    socket.on('adduser', function(data){
        if (typeof socket.room == "undefined") {
            console.log('adduser: ', socket.room + ", " + data.email);
            // store the username in the socket session for this client
            socket.username = data.user;
            socket.email = data.email;
            // store the room name in the socket session for this client
            socket.room = data.room;
            // add the client's username to the global list
            usernames[data.user] = data.user;
            // send client to room
            socket.join(data.room);
            console.log(socket.email + ", " + data.user);
            addUserToChat({'room' : data.room, 'email' : data.email});
            socket.emit('updaterooms', data);
            // echo to client they've connected
            // socket.emit('updatechat', data);
            // echo to room 1 that a person has connected to their room
            // socket.broadcast.to(data.room).emit('updatechat', data);
            // socket.emit('updaterooms', rooms, data.room);
            io.sockets.in(data.room).emit('add_to_chat', data);
            /*var roster = io.sockets.clients(data.room);

            roster.forEach(function(client) {
                console.log('io.sockets.clients: ' + io.sockets.clients);
            });*/
        }
    });

    // when the client emits 'sendchat', this listens and executes
    socket.on('sendchat', function (data) {
        // we tell the client to execute 'updatechat' with 2 parameters
        io.sockets.in(socket.room).emit('updatechat', data);
    });

    socket.on('switchRoom', function(data){
        console.log('switchRoom: ', socket.email + ", " + data.user);
        console.log('switchRoom New: ', socket.room + ", " + data.room);
        if (typeof socket.room !== "undefined") {
            // leave the current room (stored in session)
            socket.leave(socket.room);
            // io.sockets.in(prevRoom).emit('remove_from_chat', data);
            // join new room, received as function parameter
            socket.join(data.room);
            switchRooms(socket.room, data.room, data.email);
            io.sockets.in(data.room).emit('add_to_chat', data);
            // socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
            // sent message to OLD room
            // socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
            // update socket session room title
            socket.room = data.room;
            // socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
            socket.emit('updaterooms', {'room' : data.room, 'email' : data.email});
            // console.log(findClientsSocket(newroom, '/'));
        } /*else {
            socket.username = data.user;
            socket.email = data.email;
            // store the room name in the socket session for this client
            socket.room = data.room;
            // add the client's username to the global list
            usernames[data.user] = data.user;
            // send client to room
            socket.join(data.room);
            io.sockets.in(data.room).emit('add_to_chat', data);
            addUserToChat({'room' : data.room, 'email' : data.email});
        }*/
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function(){
        if (typeof socket.room !== "undefined") {
            // remove the username from global usernames list
            delete usernames[socket.username];
            // update list of users in chat, client-side
            // socket.emit('remove_from_chat', {'room' : socket.room, 'email' : socket.email});
            io.sockets.emit('updateusers', usernames);
            // echo globally that this client has left
            // socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
            socket.leave(socket.room);

            removeFromChat({'room' : socket.room, 'email' : socket.email});
        }
    });

    socket.on('add_to_chat', function (data) {
        if (rooms[data.room]) {
            rooms[data.room].push(data.email);
        } else {
            rooms[data.room] = [data.email];
        }
    });

    socket.on('remove_from_chat', function (data) {
        if (rooms[data.room]) {
            if (rooms[data.room].indexOf(data.email) > -1) {
                rooms[data.room].splice(rooms[data.room].indexOf(data.email), 1);
                console.log(rooms[data.room]);
            }
        } else {

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

function switchRooms(room, newroom, email) {
    UserInChat.findOne({
        room: room,
        email: email
    }, function(err, res) {
        if (err) throw err;
        if (res != null) {

            if (clients.indexOf(res._id.toString()) > -1) {
                clients.splice(clients.indexOf(res._id.toString()), 1);
            } else {
                UserInChat.remove({
                    room: room,
                    email: email
                }, function (err, post) {
                    if (err) return next(err);
                    addUserToChat({'room' : newroom, 'email' : email});
                });
            }
        }
    });
}

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
        if (res != null) {
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
