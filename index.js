//get our super neatly organized routez
var routes = require('./routes/index') 

//node built in mods
var fs = require('fs')
var path = require('path');

//load the modules we want
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');

//express instance
var app = express();

app.use(bodyParser.json()); //parse JSON body
app.use(bodyParser.urlencoded({'extended' : true}));

//create session
app.use(session({ 
    secret : 'default',
    resave : true,
    saveUninitialized : true
}));

app.use(function(req, res, next) {
    var context = req.session;
    if (!context.state) {
        //initialize state to lacking auth
        context.state = 'unauthenticated'
        context.ID = 123456789;
    }
    
    //middleware
    next();
});

//create our defined routes
app.use('/api', routes.API);
app.use('/', routes.packets);

//we are serving static files on every
//unused subdirectory; our routing will
//be handled primarily client-side

app.use('*', function(req, res, next) {
    staticPath = __dirname + '/public/' + path.basename(req.params[0]);
    if (fs.existsSync(staticPath)) { res.sendFile(staticPath); }
    else { next(); } //skip this middleware and die gracefullly
});

var port = 53135;
app.listen(port);