//load all the external modules once
var helpers = require('../../helpers/index');
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
    
    },
    
    edit : function(req, res) {
    
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
                            
                                    DB.bonuses.update({'_id' : BID}, {$set : newState}, {}, function(err, num) {
                                        if (err) { console.log(err); throw err; }
                                        res.status(200).send(response(true, {}));
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
    
    },
    
    message : {
    
        create : function(req, res) {
        
        },
        
        resolve : function(req, res) {
        
        },

        remove : function(req, res) {
        
        }
        
    }

}