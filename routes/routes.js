/**
 * Created by Pavel S on 22.05.17.
 */

const express = require('express');
const router = express.Router();
const passport	= require('passport');
const jwt       = require('jwt-simple');
const moment    = require('moment');
const uniqueArrayPlugin = require('mongoose-unique-array');
const async = require('async');

const config = require('../config/database'); // get db config file
const User = require('../models/user'); // get the mongoose model
const Role = require('../models/roles'); // get the mongoose model
const Table = require('../models/table'); // get the mongoose model
const Card = require('../models/card'); // get the mongoose model
const Game = require('../models/game'); // get the mongoose model
const Message = require('../models/message'); // get the mongoose model
const Chat = require('../models/chat'); // get the mongoose model
const UserInChat = require('../models/user_in_chat'); // get the mongoose model
const Chair = require('../models/chair'); // get the mongoose model
const StartedGame = require('../models/started_game'); // get the mongoose model
const UserCards = require('../models/user_cards'); // get the mongoose model
const Pack = require('../models/pack'); // get the mongoose model
const Turn = require('../models/turn'); // get the mongoose model
const GamePart = require('../models/game_part'); // get the mongoose model
const Trash = require('../models/trash'); // get the mongoose model

// test
router.get('/test', function ( req, res, next) {
   res.send('TEST page is working!!!');
   console.log('Worked!');
});

// create a new user account (POST http://localhost:8085/api/signup)
router.post('/signup', function( req, res, next ) {

    if (!req.body.name || !req.body.password) {
        res.json({success: false, msg: 'Please pass name and password.'});
    } else {
        //Set user role User
        Role.findOne({role: 'user'}, function (err, role) {
            if (err) throw err;
            var newUser = new User({
                name: req.body.name,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                password: req.body.password,
                role: role._id
            });
            //console.log('NewUser:', newUser);
            // Save the user
            newUser.save(function(err) {
                if (err) {
                    return res.json({success: false, msg: 'Username already exists.', error: err });
                }
                res.json({success: true, msg: 'Successful created new user.'});
            });
        });
    }
});

// create a new table for the game (POST http://localhost:8085/api/add_table)
router.post('/add_table',  passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({
            name: decoded.user.name
        }, function(err, user) {
            if (err) throw err;
            Game.findOne({
                name: req.body.game['name']
            }, function (err, game) {
                if (err) throw err;
                var newTable = new Table({
                    name: req.body.name,
                    ownerEmail: decoded.user.email,
                    game: game.name
                });
                //console.log('NewUser:', newUser);
                // Save the user
                newTable.save(function(err) {
                    if (err) {
                        return res.json({success: false, msg: 'Table did not create.', error: err });
                    }
                    res.json({success: true, msg: 'Successful created new table.'});
                });
            });

        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

// remove table for the game (POST http://localhost:8085/api/remove_table)
router.post('/remove_table',  passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        if (decoded.user.email == req.body.email) {
            Table.remove({
                _id: req.body.id
            }, function(err) {
                if (err) throw err;
            });
            Chat.remove({
                room: req.body.id
            }, function(err) {
                if (err) throw err;
            });
            Message.remove({
                room: req.body.id
            }, function(err) {
                if (err) throw err;
            });
            UserInChat.remove({
                room: req.body.id
            }, function(err) {
                if (err) throw err;
            });
            StartedGame.remove({
                table: req.body.id
            }, function(err) {
                if (err) throw err;
            });
            UserCards.remove({
                table: req.body.id
            }, function(err) {
                if (err) throw err;
            });
            Pack.remove({
                room: req.body.id
            }, function(err) {
                if (err) throw err;
            });
            Turn.remove({
                room: req.body.id
            }, function(err) {
                if (err) throw err;
            });
            GamePart.remove({
                room: req.body.id
            }, function(err) {
                if (err) throw err;
            });
            Trash.remove({
                room: req.body.id
            }, function(err) {
                if (err) throw err;
            });
            res.json({success: true, msg: 'Successful deleted table.'});
        } else {
            return res.json({success: false, msg: 'You are not owner of this table' });
        }
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.get('/table_list', passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        Table.find(function(err, table_list) {
            if (err) throw err;
            if (!table_list) {
                return res.status(403).send({success: false, msg: 'Tables can not receive. '});
            } else {
                res.json({success: true, table_list: table_list});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.get('/table_info', passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        Table.findOne({
            _id: req.query.id
        }, function(err, table_info) {
            if (err) throw err;
            if (!table_info) {
                return res.status(403).send({success: false, msg: 'Tables can not receive. '});
            } else {
                res.json({success: true, table_info: table_info});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.get('/chairs_list', passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        Chair.find(function(err, chairs_list) {
            if (err) throw err;
            if (!chairs_list) {
                return res.status(403).send({success: false, msg: 'Chairs can not receive. '});
            } else {
                res.json({success: true, chairs_list: chairs_list});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.get('/card_list', passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        if (req.query.type == 1) {
            Card.find({
                rank : {$gt : 4, $lt : 14}
            }, function(err, card_list) {
                if (err) throw err;
                if (!card_list) {
                    return res.status(403).send({success: false, msg: 'Cards can not receive. '});
                } else {
                    res.json({success: true, card_list: card_list});
                }
            });
        } else {
            Card.find(function(err, card_list) {
                if (err) throw err;
                if (!card_list) {
                    return res.status(403).send({success: false, msg: 'Cards can not receive. '});
                } else {
                    res.json({success: true, card_list: card_list});
                }
            });
        }
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

// route to authenticate a user (POST http://localhost:3000/api/login)
router.post('/login', function( req, res, next ) {

    User.findOne({
        email: req.body.email
    }, function( err, user ) {
        if (err) throw err;

        if (!user) {
            res.send({success: false, msg: 'Authentication failed. User not found:' + user });
        } else {

            // check if password matches
            user.comparePassword(req.body.password, function (err, isMatch) {

                if (!(isMatch && !err)) {
                    res.send({success: false, msg: 'Authentication failed. Wrong password.'});
                } else {
                    // Token expires in X day
                    var expires = moment().add(7, 'days').valueOf();
                    // if user is found and password is right create a token
                    var token = jwt.encode({user, expires}, config.secret);
                    // return the information including token as JSON
                    res.json({
                        success: true, token: "Bearer " + token,
                        user: {
                            id: user.id,
                            name: user.name,
                            firstname: user.firstname,
                            lastname: user.lastname,
                            email: user.email,
                            role: user.role
                        }
                    });
                }
            });
        }
    });
});

// route to a restricted info (GET http://localhost:3000/api/dashboard)
router.get('/dashboard', passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({
            name: decoded.user.name
        }, function(err, user) {
            if (err) throw err;
            if (!user) {
                return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
            } else {
                res.json({success: true, msg: 'Welcome in the member area ' + user.name + '!'});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.get('/role', passport.authenticate('jwt', { session: false}), function(req, res, next) {

    var token = getToken(req.headers);

    if (token) {
        var decoded = jwt.decode(token, config.secret);
        Role.findOne({
            _id: decoded.user.role
        }, function(err, role) {
            if (err) throw err;

            if (!role) {
                return res.status(403).send({success: false, msg: 'Authentication failed. '});
            } else {
                res.json({success: true, role: role});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.get('/user_info', passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        res.json({success: true, user: decoded.user});
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.get('/get_user_name', passport.authenticate('jwt', { session: false}), function(req, res, next) {

    var token = getToken(req.headers);

    if (token) {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({
            email: req.query.email
        }, function(err, user) {
            if (err) throw err;

            if (!user) {
                return res.status(403).send({success: false, msg: 'Authentication failed. '});
            } else {
                res.json({success: true, user: user.name});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.get('/games', passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        Game.find(function(err, game_list) {
            if (err) throw err;
            if (!game_list) {
                return res.status(403).send({success: false, msg: 'Games can not receive. '});
            } else {
                res.json({success: true, game_list: game_list});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.get('/get_users_in_chat', passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        UserInChat.find({
            room: req.query.room
        }, function(err, users) {
            if (err) throw err;
            if (!users) {
                return res.status(403).send({success: false, msg: 'No users. '});
            } else {
                res.json({success: true, users: users});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.get('/get_messages', passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        Message.find({
            room: req.query.room
        }, function(err, messages) {
            if (err) throw err;
            if (!messages) {
                return res.status(403).send({success: false, msg: 'No messages.'});
            } else {
                res.json({success: true, messages: messages});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.post('/add_user_to_chat',  passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        console.log(req.body);
            UserInChat.findOne({
                room: req.body.room,
                email: decoded.user.email
            }, function (err, user) {
                if (err) throw err;
                if (!user) {
                    var newUserInChat = new UserInChat({
                        room: req.body.room,
                        email: decoded.user.email,
                        chair: req.body.chair,
                        position: req.body.position,
                        chair_number: req.body.chair_number,
                        name: req.body.name
                    });
                    newUserInChat.save(function(err) {
                        if (err) {
                            return res.json({success: false, msg: 'User did not add.', error: err });
                        }
                        res.json({success: true, msg: 'Successful created new table.'});
                    });
                }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.post('/chat/save_message',  passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        var newMessage = new Message({
            message: req.body.message,
            room: req.body.room,
            nickname: decoded.user.email
        });
        newMessage.save(function(err) {
            if (err) {
                return res.json({success: false, msg: 'Message did not add.', error: err });
            }
            res.json({success: true, msg: 'Successful added new message.'});
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.post('/add_started_game',  passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        StartedGame.findOne({
            game: req.body.game,
            table: req.body.table
        }, function (err, game) {
            if (err) throw err;
            if (!game) {
                var newStartedGame = new StartedGame({
                    game: req.body.game,
                    table: req.body.table,
                    trump: req.body.trump
                });
                newStartedGame.save(function(err) {
                    if (err) {
                        return res.json({success: false, msg: 'Game did not add.', error: err });
                    }
                    res.json({success: true, msg: 'Successful created new Started Game.'});
                });
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.get('/get_started_game', passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        StartedGame.findOne({
            table: req.query.table
        }, function(err, game) {
            if (err) throw err;
            if (!game) {
                return res.status(403).send({success: false, msg: 'Started Game can not receive. '});
            } else {
                res.json({success: true, game: game});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.get('/get_user_cards', passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        UserCards.findOne({
            game: req.query.game,
            table: req.query.table,
            user: req.query.user
        }, function(err, cards) {
            if (err) throw err;
            if (!cards) {
                return res.status(403).send({success: false, msg: 'User Cards can not receive. '});
            } else {
                res.json({success: true, cards: cards.cards});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.post('/add_user_cards',  passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        UserCards.update({
            game: req.body.game,
            table: req.body.table,
            user: req.body.user
        }, req.body, {upsert: true}, function (err) {
            if (err) {
                return res.json({success: false, msg: 'Cards of user did not add.', error: err });
            }
            res.json({success: true, msg: 'Successful added Cards of user.'});
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.get('/get_user_cards_count', passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        UserCards.findOne({
            game: req.query.game,
            table: req.query.table,
            user: req.query.user
        }, function(err, cards) {
            if (err) throw err;
            if (!cards) {
                return res.status(403).send({success: false, msg: 'User Cards can not receive. '});
            } else {
                res.json({success: true, cards_count: cards.cards.length});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.get('/get_pack', passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        Pack.findOne({
            room: req.query.room
        }, function(err, pack) {
            if (err) throw err;
            if (!pack) {
                return res.status(403).send({success: false, msg: 'Pack can not receive. '});
            } else {
                res.json({success: true, pack: pack.cards});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.post('/add_turn',  passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        var newTurn = new Turn({
            game: req.body.game,
            room: req.body.room,
            user: decoded.user.email,
            card: req.body.card,
            part_game: req.body.part_game
        }, {upsert: true});
        newTurn.save(function(err) {
            if (err) {
                return res.json({success: false, msg: 'Your turn did not add.', error: err });
            }
            res.json({success: true, msg: 'Successful added new turn.'});
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.get('/get_turn', passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        Turn.find({
            room: req.query.room
        }, function(err, turns) {
            if (err) throw err;
            if (!turns) {
                return res.status(403).send({success: false, msg: 'Pack can not receive. '});
            } else {
                res.json({success: true, turns: turns});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.get('/get_game_part', passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        GamePart.find({
            room: req.query.room
        }, function(err, partsRes) {
            if (err)
                return res.status(403).send({success: false, msg: 'Part can not receive. '});
            if (!partsRes || partsRes.length < 1) {
                return res.json({success: false, parts: []});
            } else {
                var lastPart = partsRes[0];
                var turns = lastPart.turns;
                var lastTurn = turns[turns.length-1];
                var turnCards = [];
                var result;
                var next_user;
                var defendUser;
                var trashCards = [];
                for (var c = 0; c < turns.length; c++) {
                    if (turns[c]['card'][0])
                        turnCards.push(turns[c]['card'][0]);
                    if (turns[c]['move_type'] == 'defend')
                        defendUser = turns[c]['user'];
                    if (turns[c]['card'] != '')
                        trashCards.push({'card' : turns[c]['card']});
                }
                switch (lastTurn['move_type'])
                {
                    case "attack":
                        res.json({success: true, parts: lastPart});
                        break;
                    case "defend":
                        if (lastPart['ended']) {
                            next_user = lastTurn['user'];
                            return res.json({
                                success: false,
                                parts: [],
                                part: lastPart['part'],
                                lastTurn: {type: lastTurn['move_type'], next_user: next_user}});
                        } else {

                            return UserCards.findOne({
                                table: req.query.room,
                                user: turns[0]['user']
                            }, function(err, cards) {
                                for (var c = 0; c < turnCards.length; c++) {
                                    result = cards.cards.filter(x => x.card[0] === turnCards[c]);
                                    if (result.length > 0)
                                        break;
                                }
                                if (result.length > 0) {
                                    // partsRes[0].turns[turns.length-1]['whom'] = turns[0]['user'];
                                    console.log(turns[0]['user']);
                                    return res.json({success: true, parts: partsRes[0], next_user: turns[0]['user']});
                                } else {
                                    UserInChat.find({
                                        room: req.query.room,
                                        email: { $ne: lastTurn['user'] }
                                    }, function(err, users) {
                                        for (var i = 0; i < users.length; i++) {
                                            if (users[i]['email'] != turns[0]['user']) {
                                                UserCards.findOne({
                                                    table: req.query.room,
                                                    user: users[i]['email']
                                                }, function(err, cards) {
                                                    for (var c = 0; c < turnCards.length; c++) {
                                                        result = cards.cards.filter(x => x.card[0] === turnCards[c]);
                                                        if (result.length > 0)
                                                            break;
                                                    }
                                                    if (result.length > 0) {
                                                        partsRes[0].turns[turns.length-1]['whom'] = cards['user'];
                                                        return res.json({success: true, parts: partsRes[0], next_user: cards['user']});
                                                    } else {
                                                        distributionCards(req.query.room);
                                                        updateGamePart(req.query.room, req.query.ended, true);
                                                    }
                                                });
                                            }
                                        }
                                    }).sort( { chair_number: 'asc' } );
                                }
                            });
                        }
                        break;
                    case "abandon":
                        return UserInChat.find({
                            room: req.query.room
                        }, function(no_users, users) {
                            for (var i = 0; i < users.length; i++) {
                                if (users[i]['email'] == lastTurn['user']) {
                                    if (users[i+1]) {
                                        next_user = users[i+1]['email'];
                                    } else {
                                        next_user = users[0]['email'];
                                    }
                                }
                            }
                            if (no_users)
                                return res.status(403).send({success: false, msg: 'User can not receive. '});
                            return res.json({success: false, parts: [], part: lastPart['part'], lastTurn: {type: lastTurn['move_type'], next_user: next_user}});
                        }).sort( { chair_number: 'asc' } );
                        break;
                    case "skip":
                        UserInChat.find({
                            room: req.query.room,
                            email: { $ne: lastTurn['user'] }
                        }, function(err, users) {
                            for (var i = 0; i < users.length; i++) {
                                if (users[i]['email'] != turns[0]['user'] && users[i]['email'] != defendUser) {
                                    UserCards.findOne({
                                        table: req.query.room,
                                        user: users[i]['email']
                                    }, function(err, cards) {
                                        for (var c = 0; c < turnCards.length; c++) {
                                            result = cards.cards.filter(x => x.card[0] === turnCards[c]);
                                            if (result.length > 0)
                                                break;
                                        }
                                        if (result.length > 0) {
                                            partsRes[0].turns[turns.length-1]['whom'] = turns[0]['user'];
                                            res.json({success: true, parts: partsRes});
                                        } else {
                                            async.eachSeries(trashCards, function updateObject (obj, done) {
                                                // Model.update(condition, doc, callback)
                                                Trash.findOneAndUpdate({ room: req.query.room }, { $addToSet : { cards: obj.card }}, { upsert: true }, done);
                                            }, function allDone (error) {
                                                distributionCards(req.query.room);
                                                updateGamePart(req.query.room, req.query.ended, true);
                                            });
                                        }
                                    });
                                }
                            }
                        });
                        res.json({success: true, parts: parts});
                        break;

                    default:
                        return res.json({success: false, parts: []});
                }
            }

        }).sort( { part: 'desc' } );
        /*var userCards = UserCards.findOne({
            table: req.query.room,
            user: 'mark@i.ua' }).exec(function (err, cards){
            userCards = cards;
        });
        userCards.then(function (res) {
            console.log('userCards: ', res);
        });*/
        /*
        GamePart.find({
            room: req.query.room,
            ended: req.query.ended
        }, function(err, partsRes) {
            if (err) throw err;
            if (!partsRes) {
                return res.status(403).send({success: false, msg: 'Part can not receive. '});
            } else {
                if (partsRes.length < 1) {
                    return GamePart.find({
                        room: req.query.room
                    }, function(err, parts) {
                        if (parts.length < 1)
                            return res.json({success: false, parts: []});
                        var lastPartId = parts.length-1;
                        var lastPart = parts[lastPartId];
                        var lastPartTurns = lastPart.turns;
                        var lastTurnNew = lastPartTurns[lastPartTurns.length-1];
                        var next_user;
                        if (lastTurnNew['move_type'] == 'defend') {
                            next_user = lastTurnNew['user'];
                            return res.json({success: false, parts: [], part: lastPart['part'], lastTurn: {type: lastTurnNew['move_type'], next_user: next_user}});
                        }
                        if (lastTurnNew['move_type'] == 'abandon') {
                            return UserInChat.find({
                                room: req.query.room,
                                email: { $ne: lastTurnNew['user'] }
                            }, function(err, users) {
                                next_user = users[0]['email'];
                                return res.json({success: false, parts: [], part: lastPart['part'], lastTurn: {type: lastTurnNew['move_type'], next_user: next_user}});
                            }).sort( { chair_number: 'asc' } );
                        }
                    }).sort( { part: 'asc' } );
                }
                var turns = parts[0].turns;
                var lastTurn = turns[turns.length-1];
                var turnCards = [];
                var result;
                var defendUser;
                var trashCards = [];
                for (var c = 0; c < turns.length; c++) {
                    if (turns[c]['card'][0])
                        turnCards.push(turns[c]['card'][0]);
                    if (turns[c]['move_type'] == 'defend')
                        defendUser = turns[c]['user'];
                    if (turns[c]['card'] != '')
                        trashCards.push({'card' : turns[c]['card']});
                }
                if (lastTurn['move_type'] == 'skip') {
                    UserInChat.find({
                        room: req.query.room,
                        email: { $ne: lastTurn['user'] }
                    }, function(err, users) {
                        for (var i = 0; i < users.length; i++) {
                            if (users[i]['email'] != turns[0]['user'] && users[i]['email'] != defendUser) {
                                UserCards.findOne({
                                    table: req.query.room,
                                    user: users[i]['email']
                                }, function(err, cards) {
                                    for (var c = 0; c < turnCards.length; c++) {
                                        result = cards.cards.filter(x => x.card[0] === turnCards[c]);
                                        if (result.length > 0)
                                            break;
                                    }
                                    if (result.length > 0) {
                                        parts[0].turns[turns.length-1]['whom'] = turns[0]['user'];
                                        res.json({success: true, parts: parts});
                                    } else {
                                        async.eachSeries(trashCards, function updateObject (obj, done) {
                                            // Model.update(condition, doc, callback)
                                            Trash.findOneAndUpdate({ room: req.query.room }, { $addToSet : { cards: obj.card }}, { upsert: true }, done);
                                        }, function allDone (error) {
                                            distributionCards(req.query.room);
                                            updateGamePart(req.query.room, req.query.ended, true);
                                        });
                                    }
                                });
                            }
                        }
                    });
                    res.json({success: true, parts: parts});
                }
                if (lastTurn['move_type'] == 'attack') {
                    res.json({success: true, parts: parts});
                }
                if (lastTurn['move_type'] == 'defend') {
                    UserCards.findOne({
                        table: req.query.room,
                        user: turns[0]['user']
                    }, function(err, cards) {
                        for (var c = 0; c < turnCards.length; c++) {
                            result = cards.cards.filter(x => x.card[0] === turnCards[c]);
                            if (result.length > 0)
                                break;
                        }
                        if (result.length > 0) {
                            parts[0].turns[turns.length-1]['whom'] = turns[0]['user'];
                            res.json({success: true, parts: parts});
                        } else {
                            UserInChat.find({
                                room: req.query.room,
                                email: { $ne: lastTurn['user'] }
                            }, function(err, users) {
                                for (var i = 0; i < users.length; i++) {
                                    if (users[i]['email'] != turns[0]['user']) {
                                        UserCards.findOne({
                                            table: req.query.room,
                                            user: users[i]['email']
                                        }, function(err, cards) {
                                            for (var c = 0; c < turnCards.length; c++) {
                                                result = cards.cards.filter(x => x.card[0] === turnCards[c]);
                                                if (result.length > 0)
                                                    break;
                                            }
                                            if (result.length > 0) {
                                                parts[0].turns[turns.length-1]['whom'] = turns[0]['user'];
                                                res.json({success: true, parts: parts});
                                            } else {
                                                distributionCards(req.query.room);
                                                updateGamePart(req.query.room, req.query.ended, true);
                                            }
                                        });
                                    }
                                }
                            }).sort( { chair_number: 'asc' } );
                        }
                    });
                    res.json({success: true, parts: parts});
                }

            }
        }).sort( { part: 'asc' } );*/
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.post('/add_game_part',  passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        var turns = req.body.turns;

        if (turns.move_type == 'abandon') {
            async.eachSeries(turns.turns, function updateObject (obj, done) {
                // Model.update(condition, doc, callback)
                UserCards.findOneAndUpdate(
                    { table: req.body.room, user: turns.user},
                    { $addToSet : { cards: {'card': obj.card, 'rank': obj.card_rank}}}, { upsert: false }, done);
            }, function allDone (error) {
                distributionCards(req.body.room);
                updateGamePart(req.body.room, req.body.ended, true);
                GamePart.findOneAndUpdate(
                    {
                        room: req.body.room,
                        part: req.body.part
                    },
                    {
                        $push: { turns: {move_type:req.body.turns.move_type, whom:'', card_rank:'', card:'', user:req.body.turns.user} }
                    },
                    { upsert: true },
                    function (err) {

                    });
                res.json({success: true, next_user: '', move_type: turns.move_type});
            });
        } else {
            UserInChat.find({
                room: req.body.room
            }, function(err, users) {
                if (err) throw err;
                if (!users) {
                    return res.status(403).send({success: false, msg: 'users can not receive. '});
                } else {
                    var user;
                    if (req.body.turns.move_type == 'attack') {
                        console.log('req.body: ', req.body);
                        if (!req.body.notFirst) {
                            for (var i = 0; i < users.length; i++) {
                                if (users[i].email == req.body.turns.user) {
                                    if (i == users.length - 1) {
                                        user = users[0];
                                    } else {
                                        user = users[i+1];
                                    }
                                    turns['whom'] = user.email;
                                    break;
                                }
                            }
                        }
                    }
                    GamePart.findOneAndUpdate(
                        {
                            room: req.body.room,
                            part: req.body.part,
                            ended: req.body.ended
                        },
                        {
                            part: req.body.part,
                            game: req.body.game,
                            room: req.body.room,
                            $push: { turns: turns },
                            ended: req.body.ended
                        },
                        { upsert: true },
                        function (err) {
                            if (err) {
                                return res.json({success: false, msg: 'GamePart did not add.', error: err });
                            } else {
                                if (turns['move_type'] == 'skip') {
                                    res.json({success: true, next_user: turns.whom, move_type: 'defend'});
                                } else {
                                    UserCards.update({
                                        table: req.body.room,
                                        user: turns.user
                                    }, { $pull: { cards: { card: turns.card } } }, {upsert: false}, function (err) {
                                        if (err) {
                                            return res.json({success: false, msg: 'Cards of user did not remove.', error: err });
                                        } else {
                                            res.json({success: true, next_user: turns.whom, move_type: turns.move_type});
                                        }
                                    });
                                }
                            }
                        });
                }
            }).sort( { chair_number: 'asc' } );
        }
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

router.get('/get_card_info', passport.authenticate('jwt', { session: false}), function(req, res, next) {
    var token = getToken(req.headers);
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        Card.findOne({
            name : req.query.card
        }, function(err, card) {
            if (err) throw err;
            if (!card) {
                return res.status(403).send({success: false, msg: 'Card can not receive. '});
            } else {
                res.json({success: true, card: card});
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});

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

function updateGamePart(room, ended, endGame) {
    GamePart.findOneAndUpdate(
        {
            room: room,
            ended: ended
        },
        {
            ended: endGame
        },
        { upsert: false },
        function (err) {
            if (err) {
                return {success: false, msg: 'GamePart did not add.', error: err };
            } else {
                return true;
            }
        });
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

function distributionCards(room) {
    Pack.findOne({
        room : room
    }, function(err, pack) {
        var packCards = decode(pack.cards, room);
        UserInChat.find({
            room: room
        }, function(err, users) {
            for (var i = 0; i < users.length; i++) {
                UserCards.findOne({
                    table: room,
                    user: users[i]['email']
                }, function(err, cards) {
                    if (cards.cards.length < 6) {
                        pushCards(6 - cards.cards.length, packCards, cards.user, room);
                    }
                });
            }
        });
    });
}

function pushCards(count, packCards, user, room) {
    var packJson = JSON.parse(packCards);
    for (var i = 0; i < count; i++) {
        var rand = Math.floor(Math.random() * packJson.length);
        var newCard = packJson[rand];
        packJson.splice(rand, 1);

        UserCards.findOneAndUpdate(
            {
                table: room,
                user: user
            },
            {
                $push: { cards: {'card': newCard.name, 'rank': newCard.rank} }
            },
            { upsert: false },
            function (err) {
                if(!err) {
                    Pack.findOneAndUpdate(
                        {
                            room: room
                        },
                        {
                            cards: encode(JSON.stringify(packJson), room)
                        },
                        { upsert: false },
                        function (err) {
                            if(!err) {

                            }
                        });
                }
        });
    }
}

module.exports = router;
