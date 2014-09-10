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
                var bonuses = [];
                DB.bonuses.find({setID : SID}, function(err, docs) {
                    if (err) { console.log(err); throw err; }
                    async.eachSeries(docs, function(bonus, next) {
                        DB.users.findOne({'_id' : bonus.creatorID}, function(err, user) {
                            if (err) { console.log(err); throw err; }
                            bonuses.push({
                                ID : bonus['_id'],
                                answer : bonus.answer,
                                difficulty : bonus.difficulty,
                                approved : bonus.approved,
                                creatorName : user.name,
                                creatorUsername : user.username
                            });
                            
                            next();
                        });
                    }, function() {
                        res.status(200).send(response(true, {bonuses : bonuses}));
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
        var BID = parseInt(req.params.BID);
        
        DB.permissions.findOne({userID : UID, setID : SID}, function(err, doc) {
            if (err) { console.log(err); throw err; }
            
            else if (doc === null) {
                res.status(200).send(response(false, {
                    errors : [error.noPerms]
                })); return false;
            }
            
            else {
                var bonus = {};
                async.waterfall([
                    function(callback) {
                        DB.bonuses.findOne({'_id' : BID, setID : SID}, function(err, doc) {
                            if (err) { console.log(err); throw err; }
            
                            else if (doc === null) {
                                res.status(200).send(response(false, {
                                    errors : [error.noSuchBonus]
                                })); return false;
                            }
                            
                            else {
                                bonus.subjectID = doc.subjectID;
                                bonus.creatorID = doc.creatorID;
                                bonus.difficulty = doc.difficulty;
                                bonus.questions = doc.questions;
                                bonus.answers = doc.answers;
                                bonus.approved = doc.approved;
                                bonus.approvedByID = doc.approvedByID;
                                bonus.lastEditedByID = doc.lastEditedByID;
                                
                                bonus.creatorName = null;
                                bonus.creatorUsername = null;
                                bonus.approvedByName = null;
                                bonus.approvedByUsername = null;
                                bonus.lastEditedByName = null;
                                bonus.lastEditedByUsername = null;
                                
                                //blank messages array
                                bonus.messages = [];
                                
                                //now other stuff
                                callback(null);
                            }
                        });
                    },
                    
                    function(callback) {
                        DB.subjects.findOne({'_id' : bonus.subjectID}, function(err, doc) {
                            if (err) { console.log(err); throw err; }
                            bonus.subjectName = doc.subject;
                            callback(null);
                        });
                    },
                    
                    function(callback) {
                        DB.users.findOne({'_id' : bonus.creatorID}, function(err, doc) {
                            if (err) { console.log(err); throw err; }
                            bonus.creatorName = doc.name;
                            bonus.creatorUsername = doc.username;
                            callback(null);
                        });
                    },
                    
                    function(callback) {
                        if (bonus.approvedByID === null) callback(null);
                        DB.users.findOne({'_id' : bonus.approvedByID}, function(err, doc) {
                            if (err) { console.log(err); throw err; }
                            bonus.approvedByName = doc.name;
                            bonus.approvedByUsername = doc.username;
                            callback(null);
                        });
                    },
                    
                    function(callback) {
                        if (bonus.lastEditedByID === null) callback(null);
                        DB.users.findOne({'_id' : bonus.lastEditedByID}, function(err, doc) {
                            if (err) { console.log(err); throw err; }
                            bonus.lastEditedByName = doc.name;
                            bonus.lastEditedByUsername = doc.username;
                            callback(null);
                        });
                    },
                    
                    function(callback) {
                        DB.messages.find({setID : SID}, function(err, docs) {
                            if (err) { console.log(err); throw err; }
                            async.eachSeries(docs, function(message, next) {
                                DB.users.findOne({'_id' : message.userID}, function(err, doc) {
                                    if (err) { console.log(err); throw err; }
                                    bonus.messages.push({
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
                                res.status(200).send(response(true, {bonus : bonus}));
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
            !('lead' in req.body) &&
            !('questions' in req.body) &&
            !('answers' in req.body)) {
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
        
        if (Array.isArray(req.body.questions) !== true) {
            res.status(200).send(response(false, {
                errors : [error.parameter],
                errorParams : ['questions']
            })); return false;
        }
        
        if (Array.isArray(req.body.answers) !== true) {
            res.status(200).send(response(false, {
                errors : [error.parameter],
                errorParams : ['answers']
            })); return false;
        }
        
        for (var i = 0; i < req.body.questions.length; i++) {
            if (!validate.isLength(req.body.questions[i], 0, 5000)) {
                res.status(200).send(response(false, {
                    errors : [error.length],
                    errorParams : ['question']
                })); return false;
            }
        }
        
        for (var i = 0; i < req.body.answers.length; i++) {
            if (!validate.isLength(req.body.answers[i], 0, 5000)) {
                res.status(200).send(response(false, {
                    errors : [error.length],
                    errorParams : ['answer']
                })); return false;
            }
        }
        
        if (!validate.isLength(req.body.lead, 0, 1000)) {
            res.status(200).send(response(false, {
                errors : [error.length],
                errorParams : ['lead']
            })); return false;
        }
        
        var UID = req.session.ID;
        var SID = parseInt(req.params.SID);
        
        var subject = req.body.subject;
        var difficulty = req.body.difficulty;
        var questions = req.body.questions;
        var answers = req.body.answers;
        var lead = req.body.lead;
        
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
                        var newBonus = {
                            '_id' : null,
                            setID : SID,
                            subjectID : subject,
                            creatorID : UID,
                            difficulty : difficulty,
                            lead : lead,
                            questions : questions,
                            answers : answers,
                            approved : false,
                            approvedByID : null,
                            lastEditedByID : null,
                            packet : null
                        };
                        
                        DB.getNewID('bonuses', function(err, BID) {
                            if (err) { console.log(err); throw err; }
                            newBonus['_id'] = BID;
                            
                            DB.bonuses.insert(newBonus, function(err, doc) {
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
        var updateBonus = {};
        
        if ('difficulty' in req.body) {
            if (['Easy', 'Medium', 'Hard'].indexOf(req.body.difficulty) !== -1) {
                updateBonus.difficulty = req.body.difficulty;
            }
            
            else {
                res.status(200).send(response(false, {
                    errors : [error.parameter],
                    errorParams : ['difficulty']
                })); return false;
            }
        }
        
        if ('questions' in req.body) {
            if (Array.isArray(req.body.questions) !== true) {
                res.status(200).send(response(false, {
                    errors : [error.parameter],
                    errorParams : ['questions']
                })); return false;
            }
            
            else {
                for (var i = 0; i < req.body.questions.length; i++) {
                    if (!validate.isLength(req.body.questions[i], 0, 5000)) {
                        res.status(200).send(response(false, {
                            errors : [error.length],
                            errorParams : ['question']
                        })); return false;
                    }
                }
                
                updateBonus.questions = req.body.questions;
            }
        }
        
        if ('answers' in req.body) {
            if (Array.isArray(req.body.answers) !== true) {
                res.status(200).send(response(false, {
                    errors : [error.parameter],
                    errorParams : ['answers']
                })); return false;
            }
            
            else {
                for (var i = 0; i < req.body.answers.length; i++) {
                    if (!validate.isLength(req.body.answers[i], 0, 1000)) {
                        res.status(200).send(response(false, {
                            errors : [error.length],
                            errorParams : ['answer']
                        })); return false;
                    }
                }
                
                updateBonus.answers = req.body.answers;
            }
        }
        
        if ('lead' in req.body) {
            if (!validate.isLength(req.body.lead, 0, 1000)) {
                res.status(200).send(response(false, {
                    errors : [error.length],
                    errorParams : ['lead']
                })); return false;
            }
            
            else {
                updateBonus.lead = req.body.lead;
            }
        }
        
        var UID = req.session.ID;
        var SID = parseInt(req.params.SID);
        var BID = parseInt(req.params.BID);
        
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
                                    updateBonus.subject = req.body.subject;
                                    callback(null);
                                }
                            });
                        }
                        
                        else {
                            callback(null);
                        }
                    },
                    
                    function(callback) {
                        DB.bonuses.findOne({'_id' : BID, setID : SID}, function(err, doc) {
                            if (err) { console.log(err); throw err; }
            
                            else if (doc === null) {
                                res.status(200).send(response(false, {
                                    errors : [error.noSuchBonus]
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
                                        questionType : 'bonus',
                                        questionID : BID,
                                        userID : doc['_id'],
                                        ownerID : doc['_id'],
                                        senderID : UID
                                    };
                                    
                                    DB.getNewID('notifications', function(err, newID) {
                                        if (err) { console.log(err); throw err; }
                                        newNotif['_id'] = newID;
                                        
                                        DB.notifications.insert(newNotif, function(err, doc) {
                                            if (err) { console.log(err); throw err; }
                                
                                            DB.bonuses.update({'_id' : BID}, {$set : updateBonus}, {}, function(err, num) {
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
        var BID = parseInt(req.params.BID);
        
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
                
                DB.bonuses.findOne({'_id' : BID, setID : SID}, function(err, doc) {
                    if (err) { console.log(err); throw err; }
    
                    else if (doc === null) {
                        res.status(200).send(response(false, {
                            errors : [error.noSuchBonus]
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
                            DB.bonuses.remove({'_id' : BID}, {}, function(err, num) {
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
        var BID = parseInt(req.params.BID);
        
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
                
                DB.bonuses.findOne({'_id' : BID, setID : SID}, function(err, doc) {
                    if (err) { console.log(err); throw err; }
    
                    else if (doc === null) {
                        res.status(200).send(response(false, {
                            errors : [error.noSuchBonus]
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
                                questionType : 'bonus',
                                questionID : BID,
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
                                        questionType : 'bonus',
                                        questionID : BID,
                                        userID : doc['_id'],
                                        ownerID : doc['_id'],
                                        senderID : UID
                                    };
                                    
                                    DB.getNewID('notifications', function(err, newID) {
                                        if (err) { console.log(err); throw err; }
                                        newNotif['_id'] = newID;
                                        
                                        DB.notifications.insert(newNotif, function(err, doc) {
                                            if (err) { console.log(err); throw err; }
                                            
                                            DB.bonuses.update({'_id' : BID}, {$set : newState}, {}, function(err, num) {
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
        var BID = parseInt(req.params.BID);
        
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
                
                DB.bonuses.findOne({'_id' : BID, setID : SID}, function(err, doc) {
                    if (err) { console.log(err); throw err; }
    
                    else if (doc === null) {
                        res.status(200).send(response(false, {
                            errors : [error.noSuchBonus]
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
                            
                            DB.bonuses.update({'_id' : BID}, {$set : newState}, {}, function(err, num) {
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
        
        if (!('bonuses' in req.body)) {
            res.status(200).send(response(false, {
                errors : [error.missingParams]
            })); return false;
        }
        
        if (Array.isArray(req.body.bonuses) !== true) {
            res.status(200).send(response(false, {
                errors : [error.parameter],
                errorParams : ['bonuses']
            })); return false;
        }
        
        var UID = req.session.ID;
        var SID = parseInt(req.params.SID);
        var bonuses = req.body.bonuses;
        
        DB.permissions.findOne({userID : UID, setID : SID}, function(err, doc) {
            if (err) { console.log(err); throw err; }
            
            else if (doc === null) {
                res.status(200).send(response(false, {
                    errors : [error.noPerms]
                })); return false;
            }
            
            else {
                async.eachSeries(bonuses, function(bonus, next) {
                    DB.bonuses.find({'_id' : bonus, setID : SID}, function(err, doc) {
                        if (err) { console.log(err); throw err; }
                        
                        else if (doc === null) {
                            res.status(200).send(response(false, {
                                errors : [error.noSuchBonus]
                            })); return false;
                        }
                        
                        else {
                            next();
                        }
                    });
                }, function() {
                    async.eachSeries(bonuses, function(bonus, next) {
                        var others = tools.without(bonuses, bonus);
                        var message = 'This bonus is a known duplicate of ID numbers';
                        
                        for (var i = 0; i < others.length; i++) {
                            if (i === others.length - 1) message += ', and';
                            else if (i > 0) message += ',';
                            
                            message += ' <a href="' + packInfo.root + '/set/'
                                + SID.toString() + '/bonus/' + bonus.toString()
                                + '">' + bonus.toString() + '</a>'
                        }
                        
                        message += '. Please resolve these conflicts.';
                        var newMessage = {
                            '_id' : null,
                            userID : UID,
                            type : 'issue',
                            setID : SID,
                            questionType : 'bonus',
                            questionID : bonus,
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
            var BID = parseInt(req.params.BID);
            
            DB.permissions.findOne({userID : UID, setID : SID}, function(err, doc) {
                if (err) { console.log(err); throw err; }
                
                else if (doc === null) {
                    res.status(200).send(response(false, {
                        errors : [error.noPerms]
                    })); return false;
                }
                
                else {
                    DB.bonuses.findOne({'_id' : BID, setID : SID}, function(err, doc) {
                        if (err) { console.log(err); throw err; }
        
                        else if (doc === null) {
                            res.status(200).send(response(false, {
                                errors : [error.noSuchBonus]
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
                                questionType : 'bonus',
                                questionID : BID,
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
                                        questionType : 'bonus',
                                        questionID : BID
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
                                        questionType : 'bonus',
                                        questionID : BID,
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
                                            questionType : 'bonus',
                                            questionID : BID,
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
            var BID = parseInt(req.params.BID);
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
                    
                    DB.bonuses.findOne({'_id' : BID, setID : SID}, function(err, doc) {
                        if (err) { console.log(err); throw err; }
        
                        else if (doc === null) {
                            res.status(200).send(response(false, {
                                errors : [error.noSuchBonus]
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
                                            questionType : 'bonus',
                                            questionID : BID,
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
            var BID = parseInt(req.params.BID);
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
                    
                    DB.bonuses.findOne({'_id' : BID, setID : SID}, function(err, doc) {
                        if (err) { console.log(err); throw err; }
        
                        else if (doc === null) {
                            res.status(200).send(response(false, {
                                errors : [error.noSuchBonus]
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