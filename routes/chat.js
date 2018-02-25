var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
const Chat = require('../models/chat.js');
const Message = require('../models/message.js');
const User = require('../models/user.js');
const UserInChat = require('../models/user_in_chat.js');
const Pack = require('../models/pack'); // get the mongoose model
const UserCards = require('../models/user_cards'); // get the mongoose model
const Card = require('../models/card'); // get the mongoose model
var clients = [];
const passport	= require('passport');
const jwt       = require('jwt-simple');
const async = require('async');

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

    socket.on('remove-table', function (data) {
        socket.broadcast.emit('remove-table', data);
    });

    socket.on('update-table-game', function (data) {
        if (data.action == 'choose-chair') {
            io.emit('update-table-game', data);
        }
        if (data.action == 'update-pack') {
            var result = data;
            if (data.cards) {
                updatePack(data);
                io.emit('update-table-game', result);
            } else {

            }
        }
        if (data.action == 'get-lowest-trump') {
            getUsersCards(data.room, data.trump);
            // io.emit('update-table-game', {room: data.room, result: result});
        }
        if (data.action == 'turn') {
            io.emit('update-table-game', data);
        }
    });
});

function getUsersCards(room, trump) {
    var trumpsArray;
    var minRank = 14;
    var minCard = '';
    var userCards;
    UserCards.find({
        table: room
    }, function (err, user_cards) {
        userCards = user_cards;
        getUserTrumps(user_cards, trump, room);
    });

    /*UserCards.find({
        table: room
    }, function (err, user_cards) {
        if (err) {
            // return err;
        } else {
            userCards = user_cards;
            if(user_cards.length > 0) {
                for (var i = 0; i < user_cards.length; i++) {
                    var userId = i;
                    var cards = user_cards[i].cards;
                    var trumps = [];
                    var userEmail = user_cards[i].user;

                    for (var c = 0; c < cards.length; c++) {
                        if (trump == cards[c].slice(1))
                            trumps.push(cards[c]);
                    }

                    if (trumps.length > 0) {
                        var userTrumps = {user: user_cards[i].user, trumps: trumps};
                        var trumpsLen = trumps.length;
                        for (var t = 0; t < userTrumps.trumps.length; t++) {
                            console.log(trumps[t]);
                            Card.findOne({
                                name: trumps[t]
                            }, function (err, res) {
                                if (err) {
                                    // return err;
                                } else {
                                    if (res.rank < minRank) {
                                        minRank = res.rank;
                                        console.log(res.rank, res.name);
                                        console.log(userTrumps);
                                        trumpsArray = {user: userTrumps.user, minRank: res.rank, card: res.name};
                                        if (t == trumpsLen) {
                                            if (i == userCards.length) {
                                                io.emit('update-table-game', {room: room, action: 'get-lowest-trump', result: trumpsArray});
                                                // return trumpsArray;
                                            }
                                        }
                                    }
                                }
                            });
                            /!*if (result) {
                                console.log('result: ', result);
                                if (result.rank < minRank) {
                                    minRank = result.rank;
                                    minCard = result.name;
                                }
                            }*!/
                        }
                        // trumpsArray.push({user: res[i].user, minRank: {card: minCard, rank: minRank}});
                    }
                }
            }
        }

    });*/
}

function getUserTrumps(data, trump, room) {
    var userTrumps = [];
    for (var i = 0; i < data.length; i++) {
        var userId = i;
        var cards = data[i].cards;
        var trumps = [];
        var userEmail = data[i].user;

        for (var c = 0; c < cards.length; c++) {
            if (trump == cards[c].card.slice(1))
                trumps.push(cards[c]);
        }
        userTrumps.push({user: data[i].user, trumps: trumps});
    }
    getLowestTrump(userTrumps, room);
}

function getLowestTrump(userTrumps, room) {
    var minRank = 14;
    var lowestRank = {};
    for (var i=0; i < userTrumps.length; i++) {
        if (userTrumps[i].trumps.length > 0){
            var user = userTrumps[i];
            for (var j=0; j < user.trumps.length; j++) {
                if (user.trumps[j].rank < minRank) {
                    minRank = user.trumps[j].rank;
                    lowestRank = {user: user.user, card: user.trumps[j].card};
                }
            }
        }
    }
    io.emit('update-table-game', {room: room, action: 'get-lowest-trump', result: lowestRank});
}

function decode(str, room) {
    var encTable = Buffer.from(room).toString('base64');
    var customStr = Buffer.from('fmW(9f3%6bA1jhSINVV3ouYYYGb1=!v+MSA7yHBB').toString('base64');
    // var decRes = atob(str.slice(encTable.length + customStr.length));
    var decRes = Buffer.from(str.slice(encTable.length + customStr.length), 'base64').toString();
    return decRes;
}

function encode(str, room) {
    var encTable = Buffer.from(room).toString('base64');
    var encCardsArray = Buffer.from(str).toString('base64');
    var customStr = Buffer.from('fmW(9f3%6bA1jhSINVV3ouYYYGb1=!v+MSA7yHBB').toString('base64');
    var encRes = encTable + customStr + encCardsArray;
    return encRes;
}

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
    console.log('data: ', data);
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
