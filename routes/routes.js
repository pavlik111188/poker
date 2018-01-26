/**
 * Created by Pavel S on 22.05.17.
 */

const express = require('express');
const router = express.Router();
const passport	= require('passport');
const jwt       = require('jwt-simple');
const moment    = require('moment');

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
            }, function (err) {
                if (err) return next(err);
                Chat.remove({
                    room: req.body.id
                }, function(err) {
                    if (err) throw err;
                    Message.remove({
                        room: req.body.id
                    }, function(err) {
                        if (err) throw err;
                        UserInChat.remove({
                            room: req.body.id
                        }, function(err) {
                            if (err) throw err;

                        });
                    });
                });
                res.json({success: true, msg: 'Successful deleted table.'});
            });
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
        Card.find(function(err, card_list) {
            if (err) throw err;
            if (!card_list) {
                return res.status(403).send({success: false, msg: 'Cards can not receive. '});
            } else {
                res.json({success: true, card_list: card_list});
            }
        });
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
