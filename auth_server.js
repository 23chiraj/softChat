var express = require('express');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var app = express();

app.use(cookieParser());

require('./models/users_model.js');

mongoose.connect('mongodb://any:anyone@ds021915.mlab.com:21915/softchat');

app.use(bodyParser.urlencoded({ extended: false }));

app.engine('.html',require('ejs').__express);
app.set('views',__dirname + '/views');
app.set('view engine','html');

app.use(session({
                secret:'SECRET',
                resave: false,
                saveUninitialized: true,
                store:new mongoStore({
                    mongooseConnection:mongoose.createConnection('mongodb://any:anyone@ds021915.mlab.com:21915/softchat'),
                    collection: 'session' })
                }));

require('./routes.js')(app);

app.listen(process.env.PORT || 8080);