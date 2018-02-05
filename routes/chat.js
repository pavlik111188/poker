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
const Pack = require('../models/pack'); // get the mongoose model
var clients = [];
const passport	= require('passport');
const jwt       = require('jwt-simple');

server.listen(4000);

// socket io
io.on('connection', function (socket) {
    socket.on('room', function(room) {
        if (room.name) {
          socket.join(room.name);
          io.emit('join', {status: 'success'});
          socket.broadcast.emit('new-user-in-chat', room);
        }
    });

    socket.on('disconnect', function(data) {
        console.log('User disconnected ', data);
    });

    socket.on('save-message', function (data) {
        io.in(data.room).emit('new-message', { message: data });
    });

    socket.on('start-new-game', function (data) {
        socket.broadcast.emit('start-new-game', data);
    });

    socket.on('create-new-table', function (data) {
        socket.broadcast.emit('create-new-table', data);
    });

    socket.on('update-table-game', function (data) {
        io.emit('update-table-game', data);
        if (data.action == 'choose-chair') {
            io.in(data.room).emit('update-table-game', { message: data });
        }
        if (data.action == 'update-pack') {
            var result = data;
            if (data.cards) {
                updatePack(data);
                io.in(data.room).emit('update-table-game', result);
            } else {

            }
        }
    });
});

function updatePack(data) {
    /*console.log('data: ', data);
    var newPack = new Pack({
        game: data.game,
        table: data.table,
        cards: data.cards
    });
    newPack.save(function(err, res) {
        console.log('res: ', res);
        console.log('err: ', err);
        if (err) {
            return err;
        }
        return res;
    });*/
    Pack.update({room: data.room},
        {
            game: data.game,
            room: data.room,
            cards: data.cards
        },
        {upsert: true, setDefaultsOnInsert: true},
        function (err) {
            if (err) {
                return err;
            }
        });
}

function getPack(data) {
    Pack.findOne({
        room: data.room
    }, function (err, res) {
        if (err) {
            return err;
        }
        io.in(data.room).emit('update-table-game', res);
        return res;
    });
    // console.log('result: ', result);
    /*Pack.findOne({
        room: data.room
    }, function (err, res) {
        if (err) {
            return err;
        }
        console.log('res: ', res);

        result = res;
    });*/
}

module.exports = router;
