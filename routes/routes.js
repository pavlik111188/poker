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
            var newTable = new Table({
                name: req.body.name,
                ownerName: user.name
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
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }    
});

// route to authenticate a user (POST http://localhost:3000/api/login)
router.post('/login', function( req, res, next ) {
    User.findOne({
        name: req.body.name
    }, function( err, user ) {
        if (err) throw err;

        if (!user) {
            res.send({success: false, msg: 'Authentication failed. User not found:' + user });
        } else {
            // check if password matches
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    // Token expires in X day
                    var expires = moment().add(7, 'days').valueOf();
                    // if user is found and password is right create a token
                    var token = jwt.encode({user, expires}, config.secret);
                    // return the information including token as JSON
                    res.json({success: true, token: 'JWT ' + token,
                        user: {
                            id: user.id,
                            name: user.name,
                            firstname: user.firstname,
                            lastname: user.lastname,
                            email: user.email,
                            role: user.role
                        }
                    });
                } else {
                    res.send({success: false, msg: 'Authentication failed. Wrong password.'});
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
