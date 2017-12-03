var express     = require('express');
var app         = express();

var cors        = require('cors');
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport	  = require('passport');
var path        = require('path');

var config      = require('./config/database'); // get db config file
var User        = require('./models/user'); // get the mongoose model

var port        = process.env.PORT || 8085;
var jwt         = require('jwt-simple');

var routes      = require('./routes/routes');

// Use bluebird for new promises
mongoose.Promise = require('bluebird');

// CORS Middleware
app.use(cors());

// Body Pars Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Passport Midlleware
app.use(passport.initialize());
app.use(passport.session());

// log to console
app.use(morgan('dev'));

// Route (GET http://localhost:3000)
app.use(express.static(path.join(__dirname, 'public')));

// connect to database
mongoose.connect(config.database);

// pass passport for configuration
require('./config/passport')(passport);

// connect the api routes under /api/*
app.use('/', routes);

//Start the server
app.listen(port, function () {
    console.log('App listening on port: ', port)
})
