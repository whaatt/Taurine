var Handle = require('nedb');
var fs = require('fs'); //read files
var here = __dirname + '/..'; //relative

//path to counters for automatic increment
var counterPath = here + '/data/counters.db';

//thrown if the counter code failed to work
var crash = Error('Failed Initialization.');

//initialize counters if they do not already exist
if (!fs.existsSync(counterPath)) {
    var counters = new Handle({ filename: counterPath, autoload: true });
    
    var docs = [
        {_id : 'users', counter : 114252},
        {_id : 'sets', counter : 103281},
        {_id : 'flags', counter : 1},
        {_id : 'subjects', counter : 1},
        {_id : 'permissions', counter : 1},
        {_id : 'tossups', counter : 103739},
        {_id : 'bonuses', counter : 113537},
        {_id : 'messages', counter : 104534},
        {_id : 'notifications', counter : 110205}        
    ];
    
    //crash our program if this failed
    counters.insert(docs, function(err) {
        if (err) { throw crash; }
    });
}

else {
    //just start up our handler without any prior initialization
    var counters = new Handle({ filename: counterPath, autoload: true });
}

module.exports = {

    getNewID : function(table, call) {
        counters.find({_id : table}, function(err, docs) {
            if (err) { call(err); }
            if (docs.length === 0) { call(err); }
            
            //increment the appropriate counter for the next call of getNewID()
            counters.update({_id : table}, {$inc : {counter : 1}}, function(err) {
                if (err) { call(err) }
                else { call(null, docs[0].counter); }
            });
        });
    },

    users : new Handle({ filename: here + '/data/users.db', autoload: true }),
    sets : new Handle({ filename: here + '/data/sets.db', autoload: true }),
    subjects : new Handle({ filename: here + '/data/subjects.db', autoload: true }),
    permissions : new Handle({ filename: here + '/data/permissions.db', autoload: true }),
    tossups : new Handle({ filename: here + '/data/tossups.db', autoload: true }),
    bonuses : new Handle({ filename: here + '/data/bonuses.db', autoload: true }),
    messages : new Handle({ filename: here + '/data/messages.db', autoload: true }),
    flags : new Handle({ filename: here + '/data/flags.db', autoload: true }),
    notifications : new Handle({ filename: here + '/data/notifications.db', autoload: true })

}