//load all the external modules once
var helpers = require('../../helpers/index');
var packInfo = require('../../package.json');
var clean = require('sanitize-html'); //yay
var moment = require('moment'); //datetime
var async = require('async'); //argh
var tools = require('underscore');

var DB = helpers.DB; //brevity
var validate = helpers.validate;
var response = helpers.response;
var error = helpers.error

module.exports = {

    info : function(req, res) {
        if (req.session.authorized !== true) {
            res.status(200).send(response(false, {
                errors : [error.notLoggedIn]
            })); return false;
        }
        
        var UID = req.session.ID;
        var SID = parseInt(req.params.SID);
        
        DB.permissions.findOne({userID : UID, setID : SID}, function(err, doc) {
            if (err) { console.log(err); throw err; }
            
            else if (doc === null) {
                res.status(200).send(response(false, {
                    errors : [error.noPerms]
                })); return false;
            }
            
            else {
                var tossups = [];
                DB.tossups.find({setID : SID}, function(err, docs) {
                    if (err) { console.log(err); throw err; }
                    async.eachSeries(docs, function(tossup, next) {
                        DB.users.findOne({'_id' : tossup.creatorID}, function(err, user) {
                            if (err) { console.log(err); throw err; }
                            tossups.push({
                                ID : tossup['_id'],
                                answer : tossup.answer,
                                difficulty : tossup.difficulty,
                                approved : tossup.approved,
                                creatorName : user.name,
                                creatorUsername : user.username
                            });
                            
                            next();
                        });
                    }, function() {
                        res.status(200).send(response(true, {tossups : tossups}));
                    });
                });
            }
        });
    },
    
    get : function(req, res) {
        if (req.session.authorized !== true) {
            res.status(200).send(response(false, {
                errors : [error.notLoggedIn]
            })); return false;
        }
        
        var UID = req.session.ID;
        var SID = parseInt(req.params.SID);
        var TID = parseInt(req.params.TID);
        
        DB.permissions.findOne({userID : UID, setID : SID}, function(err, doc) {
            if (err) { console.log(err); throw err; }
            
            else if (doc === null) {
                res.status(200).send(response(false, {
                    errors : [error.noPerms]
                })); return false;
            }
            
            else {
                var tossup = {};
                async.waterfall([
                    function(callback) {
                        DB.tossups.findOne({'_id' : TID, setID : SID}, function(err, doc) {
                            if (err) { console.log(err); throw err; }
            
                            else if (doc === null) {
                                res.status(200).send(response(false, {
                                    errors : [error.noSuchTossup]
                                })); return false;
                            }
                            
                            else {
                                tossup.subjectID = doc.subjectID;
                                tossup.creatorID = doc.creatorID;
                                tossup.difficulty = doc.difficulty;
                                tossup.question = doc.question;
                                tossup.answer = doc.answer;
                                tossup.approved = doc.approved;
                                tossup.approvedByID = doc.approvedByID;
                                tossup.lastEditedByID = doc.lastEditedByID;
                                
                                tossup.creatorName = null;
                                tossup.creatorUsername = null;
                                tossup.approvedByName = null;
                                tossup.approvedByUsername = null;
                                tossup.lastEditedByName = null;
                                tossup.lastEditedByUsername = null;
                                
                                //blank messages array
                                tossup.messages = [];
                                
                                //now other stuff
                                callback(null);
                            }
                        });
                    },
                    
                    function(callback) {
                        DB.subjects.findOne({'_id' : tossup.subjectID}, function(err, doc) {
                            if (err) { console.log(err); throw err; }
                            tossup.subjectName = doc.subject;
                            callback(null);
                        });
                    },
                    
                    function(callback) {
                        DB.users.findOne({'_id' : tossup.creatorID}, function(err, doc) {
                            if (err) { console.log(err); throw err; }
                            tossup.creatorName = doc.name;
                            tossup.creatorUsername = doc.username;
                            callback(null);
                        });
                    },
                    
                    function(callback) {
                        if (tossup.approvedByID === null) callback(null);
                        DB.users.findOne({'_id' : tossup.approvedByID}, function(err, doc) {
                            if (err) { console.log(err); throw err; }
                            tossup.approvedByName = doc.name;
                            tossup.approvedByUsername = doc.username;
                            callback(null);
                        });
                    },
                    
                    function(callback) {
                        if (tossup.lastEditedByID === null) callback(null);
                        DB.users.findOne({'_id' : tossup.lastEditedByID}, function(err, doc) {
                            if (err) { console.log(err); throw err; }
                            tossup.lastEditedByName = doc.name;
                            tossup.lastEditedByUsername = doc.username;
                            callback(null);
                        });
                    },
                    
                    function(callback) {
                        DB.messages.find({setID : SID}, function(err, docs) {
                            if (err) { console.log(err); throw err; }
                            async.eachSeries(docs, function(message, next) {
                                DB.users.findOne({'_id' : message.userID}, function(err, doc) {
                                    if (err) { console.log(err); throw err; }
                                    tossup.messages.push({
                                        ID : doc['_id'],
                                        senderID : message.userID,
                                        senderName : doc.name,
                                        senderUsername : doc.username,
                                        type : doc.type,
                                        message : doc.message,
                                        date : doc.date,
                                        resolved : doc.resolved
                                    });
                                });
                            }, function() {
                                res.status(200).send(response(true, {tossup : tossup}));
                            });
                        });
                    }
                ]);
            }
        });
    },
    
    create : function(req, res) {
        if (req.session.authorized !== true) {
            res.status(200).send(response(false, {
                errors : [error.notLoggedIn]
            })); return false;
        }
        
        if (!('subject' in req.body) &&
            !('difficulty' in req.body) &&
            !('question' in req.body) &&
            !('answer' in req.body)) {
            res.status(200).send(response(false, {
                errors : [error.missingParams]
            })); return false;
        }
        
        if (['Easy', 'Medium', 'Hard'].indexOf(req.body.difficulty) === -1) {
            res.status(200).send(response(false, {
                errors : [error.parameter],
                errorParams : ['difficulty']
            })); return false;
        }
        
        if (!validate.isLength(req.body.question, 0, 5000)) {
            res.status(200).send(response(false, {
                errors : [error.length],
                errorParams : ['question']
            })); return false;
        }
        
        if (!validate.isLength(req.body.answer, 0, 1000)) {
            res.status(200).send(response(false, {
                errors : [error.length],
                errorParams : ['answer']
            })); return false;
        }
        
        var UID = req.session.ID;
        var SID = parseInt(req.params.SID);
        
        var subject = req.body.subject;
        var difficulty = req.body.difficulty;
        var question = req.body.question;
        var answer = req.body.answer;
        
        DB.permissions.findOne({userID : UID, setID : SID}, function(err, doc) {
            if (err) { console.log(err); throw err; }
            
            else if (doc === null) {
                res.status(200).send(response(false, {
                    errors : [error.noPerms]
                })); return false;
            }
            
            else {
                DB.subjects.findOne({'_id' : subject, setID : SID}, function(err, doc) {
                    if (err) { console.log(err); throw err; }
            
                    else if (doc === null) {
                        res.status(200).send(response(false, {
                            errors : [error.noSuchSubject]
                        })); return false;
                    }
                    
                    else {
                        var newTossup = {
                            '_id' : null,
                            setID : SID,
                            subjectID : subject,
                            creatorID : UID,
                            difficulty : difficulty,
                            question : question,
                            answer : answer,
                            approved : false,
                            approvedByID : null,
                            lastEditedByID : null,
                            packet : null
                        };
                        
                        DB.getNewID('tossups', function(err, TID) {
                            if (err) { console.log(err); throw err; }
                            newTossup['_id'] = TID;
                            
                            DB.tossups.insert(newTossup, function(err, doc) {
                                if (err) { console.log(err); throw err; }
                                res.status(200).send(response(true, {}));
                            });
                        });
                    }
                });
            }
        });
    },
    
    edit : function(req, res) {
        if (req.session.authorized !== true) {
            res.status(200).send(response(false, {
                errors : [error.notLoggedIn]
            })); return false;
        }
        
        //to be set in DB
        var updateTossup = {};
        
        if ('difficulty' in req.body) {
            if (['Easy', 'Medium', 'Hard'].indexOf(req.body.difficulty) !== -1) {
                updateTossup.difficulty = req.body.difficulty;
            }
            
            else {
                res.status(200).send(response(false, {
                    errors : [error.parameter],
                    errorParams : ['difficulty']
                })); return false;
            }
        }
        
        if ('question' in req.body) {
            if (!validate.isLength(req.body.question, 0, 5000)) {
                res.status(200).send(response(false, {
                    errors : [error.length],
                    errorParams : ['question']
                })); return false;
            }
            
            else {
                updateTossup.question = req.body.question;
            }
        }
        
        if ('answer' in req.body) {
            if (!validate.isLength(req.body.answer, 0, 5000)) {
                res.status(200).send(response(false, {
                    errors : [error.length],
                    errorParams : ['answer']
                })); return false;
            }
            
            else {
                updateTossup.answer = req.body.answer;
            }
        }
        
        var UID = req.session.ID;
        var SID = parseInt(req.params.SID);
        var TID = parseInt(req.params.TID);
        
        DB.permissions.findOne({userID : UID, setID : SID}, function(err, doc) {
            if (err) { console.log(err); throw err; }
            
            else if (doc === null) {
                res.status(200).send(response(false, {
                    errors : [error.noPerms]
                })); return false;
            }
            
            else {
                var role = doc.role;
                var focus = doc.focus;
                
                async.waterfall([
                    function(callback) {
                        if ('subject' in req.body) {
                            DB.subjects.findOne({'_id' : req.body.subject, setID : SID}, function(err, doc) {
                                if (err) { console.log(err); throw err; }
                        
                                else if (doc === null) {
                                    res.status(200).send(response(false, {
                                        errors : [error.noSuchSubject]
                                    })); return false;
                                }
                                
                                else {
                                    updateTossup.subject = req.body.subject;
                                    callback(null);
                                }
                            });
                        }
                        
                        else {
                            callback(null);
                        }
                    },
                    
                    function(callback) {
                        DB.tossups.findOne({'_id' : TID, setID : SID}, function(err, doc) {
                            if (err) { console.log(err); throw err; }
            
                            else if (doc === null) {
                                res.status(200).send(response(false, {
                                    errors : [error.noSuchTossup]
                                })); return false;
                            }
                            
                            else {
                                if ((!(role === 'Director')) &&
                                    (!(role === 'Administrator')) &&
                                    (!(UID === doc.userID)) &&
                                    (!(role === 'Editor' && focus.indexOf(doc.subjectID) !== -1))) {
                                    res.status(200).send(response(false, {
                                        errors : [error.noPermsAction]
                                    })); return false;                                
                                }
                            
                                else if (doc.packet !== null) {
                                    res.status(200).send(response(false, {
                                        errors : [error.currentlyAssigned]
                                    })); return false; 
                                }
                                
                                else {
                                    var newNotif = {
                                        '_id' : null,
                                        type : 'edit',
                                        setID : SID,
                                        questionType : 'tossup',
                                        questionID : TID,
                                        userID : doc['_id'],
                                        ownerID : doc['_id'],
                                        senderID : UID
                                    };
                                    
                                    DB.getNewID('notifications', function(err, newID) {
                                        if (err) { console.log(err); throw err; }
                                        newNotif['_id'] = newID;
                                        
                                        DB.notifications.insert(newNotif, function(err, doc) {
                                            if (err) { console.log(err); throw err; }
                                
                                            DB.tossups.update({'_id' : TID}, {$set : updateTossup}, {}, function(err, num) {
                                                if (err) { console.log(err); throw err; }
                                                res.status(200).send(response(true, {}));
                                            });
                                        });
                                    });
                                }
                            }
                        });
                    }
                ]);
            }
        });
    },
    
    remove : function(req, res) {
        if (req.session.authorized !== true) {
            res.status(200).send(response(false, {
                errors : [error.notLoggedIn]
            })); return false;
        }
        
        var UID = req.session.ID;
        var SID = parseInt(req.params.SID);
        var TID = parseInt(req.params.TID);
        
        DB.permissions.findOne({userID : UID, setID : SID}, function(err, doc) {
            if (err) { console.log(err); throw err; }
            
            else if (doc === null) {
                res.status(200).send(response(false, {
                    errors : [error.noPerms]
                })); return false;
            }
            
            else {
                var role = doc.role;
                var focus = doc.focus;
                
                DB.tossups.findOne({'_id' : TID, setID : SID}, function(err, doc) {
                    if (err) { console.log(err); throw err; }
    
                    else if (doc === null) {
                        res.status(200).send(response(false, {
                            errors : [error.noSuchTossup]
                        })); return false;
                    }
                    
                    else {
                        if ((!(role === 'Director')) &&
                            (!(role === 'Administrator')) &&
                            (!(UID === doc.userID)) &&
                            (!(role === 'Editor' && focus.indexOf(doc.subjectID) !== -1))) {
                            res.status(200).send(response(false, {
                                errors : [error.noPermsAction]
                            })); return false;                                
                        }
                        
                        else {
                            DB.tossups.remove({'_id' : TID}, {}, function(err, num) {
                                if (err) { console.log(err); throw err; }
                                res.status(200).send(response(true, {}));
                            });
                        }
                    }
                });
            }
        });
    },
    
    approve : function(req, res) {
        if (req.session.authorized !== true) {
            res.status(200).send(response(false, {
                errors : [error.notLoggedIn]
            })); return false;
        }
        
        var UID = req.session.ID;
        var SID = parseInt(req.params.SID);
        var TID = parseInt(req.params.TID);
        
        DB.permissions.findOne({userID : UID, setID : SID}, function(err, doc) {
            if (err) { console.log(err); throw err; }
            
            else if (doc === null) {
                res.status(200).send(response(false, {
                    errors : [error.noPerms]
                })); return false;
            }
            
            else {
                var role = doc.role;
                var focus = doc.focus;
                
                DB.tossups.findOne({'_id' : TID, setID : SID}, function(err, doc) {
                    if (err) { console.log(err); throw err; }
    
                    else if (doc === null) {
                        res.status(200).send(response(false, {
                            errors : [error.noSuchTossup]
                        })); return false;
                    }
                    
                    else {
                        if ((!(role === 'Director')) &&
                            (!(role === 'Administrator')) &&
                            (!(role === 'Editor' && focus.indexOf(doc.subjectID) !== -1))) {
                            res.status(200).send(response(false, {
                                errors : [error.noPermsAction]
                            })); return false;                                
                        }
                        
                        else {
                            var targetMessages = {
                                questionType : 'tossup',
                                questionID : TID,
                                type : 'issue',
                                resolved : false
                            };
                            
                            DB.messages.find(targetMessages, function(err, docs) {
                                if (err) { console.log(err); throw err; }
                                
                                else if (docs.length === 0) {
                                    var newState = {
                                        approved : true,
                                        approvedByID : UID
                                    };
                            
                                    var newNotif = {
                                        '_id' : null,
                                        type : 'approve',
                                        setID : SID,
                                        questionType : 'tossup',
                                        questionID : TID,
                                        userID : doc['_id'],
                                        ownerID : doc['_id'],
                                        senderID : UID
                                    };
                                    
                                    DB.getNewID('notifications', function(err, newID) {
                                        if (err) { console.log(err); throw err; }
                                        newNotif['_id'] = newID;
                                        
                                        DB.notifications.insert(newNotif, function(err, doc) {
                                            if (err) { console.log(err); throw err; }
                                            
                                            DB.tossups.update({'_id' : TID}, {$set : newState}, {}, function(err, num) {
                                                if (err) { console.log(err); throw err; }
                                                res.status(200).send(response(true, {}));
                                            });
                                        });
                                    });
                                }
                                
                                else {
                                    res.status(200).send(response(false, {
                                        errors : [error.issuesExist]
                                    })); return false;
                                }
                            });
                        }
                    }
                });
            }
        });    
    },
    
    disapprove : function(req, res) {
        if (req.session.authorized !== true) {
            res.status(200).send(response(false, {
                errors : [error.notLoggedIn]
            })); return false;
        }
        
        var UID = req.session.ID;
        var SID = parseInt(req.params.SID);
        var TID = parseInt(req.params.TID);
        
        DB.permissions.findOne({userID : UID, setID : SID}, function(err, doc) {
            if (err) { console.log(err); throw err; }
            
            else if (doc === null) {
                res.status(200).send(response(false, {
                    errors : [error.noPerms]
                })); return false;
            }
            
            else {
                var role = doc.role;
                var focus = doc.focus;
                
                DB.tossups.findOne({'_id' : TID, setID : SID}, function(err, doc) {
                    if (err) { console.log(err); throw err; }
    
                    else if (doc === null) {
                        res.status(200).send(response(false, {
                            errors : [error.noSuchTossup]
                        })); return false;
                    }
                    
                    else {
                        if ((!(role === 'Director')) &&
                            (!(role === 'Administrator')) &&
                            (!(role === 'Editor' && focus.indexOf(doc.subjectID) !== -1))) {
                            res.status(200).send(response(false, {
                                errors : [error.noPermsAction]
                            })); return false;                                
                        }
                        
                        else if (doc.packet !== null) {
                            res.status(200).send(response(false, {
                                errors : [error.currentlyAssigned]
                            })); return false; 
                        }
                        
                        else {
                            var newState = {
                                approved : false,
                                approvedByID : null
                            };
                            
                            DB.tossups.update({'_id' : TID}, {$set : newState}, {}, function(err, num) {
                                if (err) { console.log(err); throw err; }
                                res.status(200).send(response(true, {}));
                            });
                        }
                    }
                });
            }
        });  
    },
    
    duplicate : function(req, res) {
        if (req.session.authorized !== true) {
            res.status(200).send(response(false, {
                errors : [error.notLoggedIn]
            })); return false;
        }
        
        if (!('tossups' in req.body)) {
            res.status(200).send(response(false, {
                errors : [error.missingParams]
            })); return false;
        }
        
        if (Array.isArray(req.body.tossups) !== true) {
            res.status(200).send(response(false, {
                errors : [error.parameter],
                errorParams : ['tossups']
            })); return false;
        }
        
        var UID = req.session.ID;
        var SID = parseInt(req.params.SID);
        var tossups = req.body.tossups;
        
        DB.permissions.findOne({userID : UID, setID : SID}, function(err, doc) {
            if (err) { console.log(err); throw err; }
            
            else if (doc === null) {
                res.status(200).send(response(false, {
                    errors : [error.noPerms]
                })); return false;
            }
            
            else {
                async.eachSeries(tossups, function(tossup, next) {
                    DB.tossups.find({'_id' : tossup, setID : SID}, function(err, doc) {
                        if (err) { console.log(err); throw err; }
                        
                        else if (doc === null) {
                            res.status(200).send(response(false, {
                                errors : [error.noSuchTossup]
                            })); return false;
                        }
                        
                        else {
                            next();
                        }
                    });
                }, function() {
                    async.eachSeries(tossups, function(tossup, next) {
                        var others = tools.without(tossups, tossup);
                        var message = 'This tossup is a known duplicate of ID numbers';
                        
                        for (var i = 0; i < others.length; i++) {
                            if (i === others.length - 1) message += ', and';
                            else if (i > 0) message += ',';
                            
                            message += ' <a href="' + packInfo.root + '/set/'
                                + SID.toString() + '/tossup/' + tossup.toString()
                                + '">' + tossup.toString() + '</a>'
                        }
                        
                        message += '. Please resolve these conflicts.';
                        var newMessage = {
                            '_id' : null,
                            userID : UID,
                            type : 'issue',
                            setID : SID,
                            questionType : 'tossup',
                            questionID : tossup,
                            message : message,
                            date : moment().format('YYYY-MM-DD HH:mm:ss'),
                            resolved : false
                        }
                        
                        DB.getNewID('messages', function(err, MID) {
                            newMessage['_id'] = MID;
                            DB.messages.insert(newMessage, function(err, doc) {
                                if (err) { console.log(err); throw err; }
                                next();
                            });
                        });
                    }, function() {
                        res.status(200).send(response(true, {}));
                    });
                });
            }
        });
    },
    
    message : {
    
        create : function(req, res) {
            if (req.session.authorized !== true) {
                res.status(200).send(response(false, {
                    errors : [error.notLoggedIn]
                })); return false;
            }
            
            if ((!('message' in req.body)) ||
                (!('type' in req.body))) {
                res.status(200).send(response(false, {
                    errors : [error.missingParams]
                })); return false;
            }
            
            var message = req.body.message;
            var type = req.body.type;
            
            if (message === '') {
                res.status(200).send(response(false, {
                    errors : [error.blank],
                    errorParams : ['message']
                })); return false;
            }
            
            if (!validate.isLength(message, 1, 10000)) {
                res.status(200).send(response(false, {
                    errors : [error.length],
                    errorParams : ['message']
                })); return false;
            }
            
            if (['comment', 'issue'].indexOf(type) === -1) {
                res.status(200).send(response(false, {
                    errors : [error.parameter],
                    errorParams : ['type']
                })); return false;
            }
            
            var UID = req.session.ID;
            var SID = parseInt(req.params.SID);
            var TID = parseInt(req.params.TID);
            
            DB.permissions.findOne({userID : UID, setID : SID}, function(err, doc) {
                if (err) { console.log(err); throw err; }
                
                else if (doc === null) {
                    res.status(200).send(response(false, {
                        errors : [error.noPerms]
                    })); return false;
                }
                
                else {
                    DB.tossups.findOne({'_id' : TID, setID : SID}, function(err, doc) {
                        if (err) { console.log(err); throw err; }
        
                        else if (doc === null) {
                            res.status(200).send(response(false, {
                                errors : [error.noSuchTossup]
                            })); return false;
                        }
                        
                        else if (doc.packet !== null && type === 'issue') {
                            res.status(200).send(response(false, {
                                errors : [error.currentlyAssigned]
                            })); return false;
                        }
                        
                        else {
                            message = clean(message, {
                                allowedTags: [ 'b', 'i', 'u', 'em', 'strong', 'a' ],
                                allowedAttributes: { 'a': [ 'href' ] },
                            });
                            
                            var owner = doc.userID;
                            var notifUsers = [];
                            var newMessage = {
                                '_id' : null,
                                userID : UID,
                                type : type,
                                setID : SID,
                                questionType : 'tossup',
                                questionID : TID,
                                message : message,
                                date : moment().format('YYYY-MM-DD HH:mm:ss'),
                                resolved : type === 'issue' ? false : true
                            }
                            
                            async.waterfall([
                                function(callback) {
                                    DB.getNewID('messages', function(err, MID) {
                                        if (err) { console.log(err); throw err; }
                                        newMessage['_id'] = MID; callback(null);
                                    });
                                },
                                
                                function(callback) {
                                    var targetMessage = {
                                        setID : SID,
                                        questionType : 'tossup',
                                        questionID : TID
                                    }
                                    
                                    DB.messages.find(targetMessages, function(err, docs) {
                                        tools.each(docs, function(message) {
                                            if (message.userID !== UID) {
                                                notifUsers.push(message.userID);
                                            }
                                        });
                                        
                                        //dedupe list of users
                                        var notifUsers = tools.uniq(notifUsers);
                                    });
                                },
                                
                                function(callback) {
                                    DB.messages.insert(newMessage, function(err, doc) {
                                        if (err) { console.log(err); throw err; }
                                        callback(null);
                                    });
                                },
                                
                                function(callback) {
                                    var newNotif = {
                                        '_id' : null,
                                        type : 'message',
                                        setID : SID,
                                        questionType : 'tossup',
                                        questionID : TID,
                                        userID : owner,
                                        ownerID : owner,
                                        senderID : UID
                                    };
                                    
                                    DB.getNewID('notifications', function(err, NID) {
                                        if (err) { console.log(err); throw err; }
                                        newNotif['_id'] = NID;
                                        
                                        DB.notifications.insert(newNotif, function(err, doc) {
                                            if (err) { console.log(err); throw err; }
                                            callback(null);
                                        });
                                    });
                                },
                                
                                function(callback) {
                                    async.eachSeries(notifUsers, function(notifUser, next) {
                                        var newNotif = {
                                            '_id' : null,
                                            type : 'reply',
                                            setID : SID,
                                            questionType : 'tossup',
                                            questionID : TID,
                                            userID : notifUser,
                                            ownerID : owner,
                                            senderID : UID
                                        };
                                        
                                        DB.getNewID('notifications', function(err, NID) {
                                            if (err) { console.log(err); throw err; }
                                            newNotif['_id'] = NID;
                                            
                                            DB.notifications.insert(newNotif, function(err, doc) {
                                                if (err) { console.log(err); throw err; }
                                                next();
                                            });
                                        });
                                    }, function() {
                                        res.status(200).send(response(true, {transformed : message}));
                                    });
                                }
                            ]);
                        }
                    });
                }
            });
        },
        
        resolve : function(req, res) {
            if (req.session.authorized !== true) {
                res.status(200).send(response(false, {
                    errors : [error.notLoggedIn]
                })); return false;
            }
            
            var UID = req.session.ID;
            var SID = parseInt(req.params.SID);
            var TID = parseInt(req.params.TID);
            var MID = parseInt(req.params.MID);
            
            DB.permissions.findOne({userID : UID, setID : SID}, function(err, doc) {
                if (err) { console.log(err); throw err; }
                
                else if (doc === null) {
                    res.status(200).send(response(false, {
                        errors : [error.noPerms]
                    })); return false;
                }
                
                else {
                    var role = doc.role;
                    var focus = doc.focus;
                    
                    DB.tossups.findOne({'_id' : TID, setID : SID}, function(err, doc) {
                        if (err) { console.log(err); throw err; }
        
                        else if (doc === null) {
                            res.status(200).send(response(false, {
                                errors : [error.noSuchTossup]
                            })); return false;
                        }
                        
                        else {
                            var owner = doc.userID;
                            if ((!(role === 'Director')) &&
                                (!(role === 'Administrator')) &&
                                (!(role === 'Editor' && focus.indexOf(doc.subjectID) !== -1))) {
                                res.status(200).send(response(false, {
                                    errors : [error.noPermsAction]
                                })); return false;                                
                            }
                            
                            DB.messages.findOne({'_id' : MID, setID : SID}, function(err, doc) {
                                if (err) { console.log(err); throw err; }
                                
                                else if (doc === null) {
                                    res.status(200).send(response(false, {
                                        errors : [error.noSuchMessage]
                                    })); return false;
                                }
                                
                                else {
                                    var messageOwner = doc.userID;
                                    var resolveMe = {$set : {resolved : true}};
                                    DB.messages.update({'_id' : MID}, resolveMe, {}, function(err, num) {
                                        if (err) { console.log(err); throw err; }
                                        
                                        var newNotif = {
                                            '_id' : null,
                                            type : 'resolve',
                                            setID : SID,
                                            questionType : 'tossup',
                                            questionID : TID,
                                            userID : messageOwner,
                                            ownerID : owner,
                                            senderID : UID
                                        };
                                        
                                        DB.notifications.insert(newNotif, function(err, doc) {
                                            if (err) { console.log(err); throw err; }
                                            res.status(200).send(response(true, {}));
                                        });
                                    });
                                }
                            });
                        }
                    });
                }
            });
        },

        remove : function(req, res) {
            if (req.session.authorized !== true) {
                res.status(200).send(response(false, {
                    errors : [error.notLoggedIn]
                })); return false;
            }
            
            var UID = req.session.ID;
            var SID = parseInt(req.params.SID);
            var TID = parseInt(req.params.TID);
            var MID = parseInt(req.params.MID);
            
            DB.permissions.findOne({userID : UID, setID : SID}, function(err, doc) {
                if (err) { console.log(err); throw err; }
                
                else if (doc === null) {
                    res.status(200).send(response(false, {
                        errors : [error.noPerms]
                    })); return false;
                }
                
                else {
                    var role = doc.role;
                    var focus = doc.focus;
                    
                    DB.tossups.findOne({'_id' : TID, setID : SID}, function(err, doc) {
                        if (err) { console.log(err); throw err; }
        
                        else if (doc === null) {
                            res.status(200).send(response(false, {
                                errors : [error.noSuchTossup]
                            })); return false;
                        }
                        
                        else {
                            var owner = doc.userID;
                            if ((!(owner === UID)) &&
                                (!(role === 'Director')) &&
                                (!(role === 'Administrator')) &&
                                (!(role === 'Editor' && focus.indexOf(doc.subjectID) !== -1))) {
                                res.status(200).send(response(false, {
                                    errors : [error.noPermsAction]
                                })); return false;                                
                            }
                            
                            DB.messages.findOne({'_id' : MID, setID : SID}, function(err, doc) {
                                if (err) { console.log(err); throw err; }
                                
                                else if (doc === null) {
                                    res.status(200).send(response(false, {
                                        errors : [error.noSuchMessage]
                                    })); return false;
                                }
                                
                                else {
                                    DB.messages.remove({'_id' : MID}, {}, function(err, num) {
                                        if (err) { console.log(err); throw err; }
                                        res.status(200).send(response(true, {}));
                                    });
                                }
                            });
                        }
                    });
                }
            });        
        }
        
    }

}