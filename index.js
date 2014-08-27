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
    if (!context.authorized) {
        //initialize state to lacking auth
        context.authorized = false;
    }
    
    //middleware
    next();
});

//create our defined routes
app.use('/api', routes.API);
app.use('/sets', routes.packets);

//we are serving static files on every
//unused subdirectory; our routing will
//be handled primarily client-side

app.use('*', function(req, res) {
    newPath = req.params[0].split('/'); newPath.reverse(); //hacky
    staticPath = __dirname + '/public/' + newPath[1] + '/' + newPath[0];
    
    //write tests for stupid hack
    if (fs.existsSync(staticPath)) {
        if (fs.statSync(staticPath).isDirectory()) {
            //send index if requested file is really a dir
            res.sendFile(__dirname + '/public/index.html');
        }
        
        else {
            //send file if it is
            res.sendFile(staticPath);
        }
    }
    
    else {
        //if the path does not exist then send index
        res.sendFile(__dirname + '/public/index.html');
    }
});

var port = 53135;
app.listen(port);