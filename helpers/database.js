var Handle = require('nedb');
var bcrypt = require('bcrypt');
var fs = require('fs'); //read files
var here = __dirname + '/..'; //relative

//path to counters for automatic increment
var counterPath = here + '/data/counters.db';

//thrown if the counter code failed to work
var crash = Error('Failed Initialization.');

//initialize counters if they do not already exist
if (!fs.existsSync(counterPath)) {
    var counters = new Handle({ filename: counterPath, autoload: true });
    
    var countDocs = [
        {_id : 'users', counter : 114252},
        {_id : 'sets', counter : 103281},
        {_id : 'subjects', counter : 1},
        {_id : 'permissions', counter : 1},
        {_id : 'tossups', counter : 103739},
        {_id : 'bonuses', counter : 113537},
        {_id : 'messages', counter : 104534},
        {_id : 'notifications', counter : 110205}        
    ];
    
    //crash our program if this failed
    counters.insert(countDocs, function(err) {
        if (err) { throw crash; }
    });
}

else {
    //just start up our handler without any prior initialization
    var counters = new Handle({ filename: counterPath, autoload: true });
}

var users = new Handle({ filename: here + '/data/users.db', autoload: true });
var sets = new Handle({ filename: here + '/data/sets.db', autoload: true });
var subjects = new Handle({ filename: here + '/data/subjects.db', autoload: true });
var permissions = new Handle({ filename: here + '/data/permissions.db', autoload: true });
var tossups = new Handle({ filename: here + '/data/tossups.db', autoload: true });
var bonuses = new Handle({ filename: here + '/data/bonuses.db', autoload: true });
var messages = new Handle({ filename: here + '/data/messages.db', autoload: true });
var flags = new Handle({ filename: here + '/data/flags.db', autoload: true });
var notifications = new Handle({ filename: here + '/data/notifications.db', autoload: true });        
            
module.exports = {

    getNewID : function(table, call) {
        counters.findOne({_id : table}, function(err, doc) {
            if (err) { call(err); }
            if (doc === null) { call(err); }
            
            //increment the appropriate counter for the next call of getNewID()
            counters.update({_id : table}, {$inc : {counter : 1}}, function(err) {
                if (err) { call(err) }
                else { call(null, doc.counter); }
            });
        });
    },
    
    getUserByID : function(ID, call) {
        users.findOne({'_id' : ID}, function(err, doc) {
            if (err) { call(err); }
            else { call(null, doc); }
        });
    },
    
    hash : function(password, call) {
        bcrypt.genSalt(10, function(err, salt) { //generate salt
            bcrypt.hash(password, salt, function(err, hash) {
                call(null, hash);
            });
        });
    },
    
    verify : function(password, hash, call) {
        bcrypt.compare(password, hash, function(err, res) {
            call(null, res);
        });
    },
    
    random : function() {
        return Math.random().toString(36).slice(-8);
    },

    users : users,
    sets : sets,
    subjects : subjects,
    permissions : permissions,
    tossups : tossups,
    bonuses : bonuses,
    messages : messages,
    notifications : notifications

}