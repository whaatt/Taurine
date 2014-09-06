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
                            
                                    DB.tossups.update({'_id' : TID}, {$set : newState}, {}, function(err, num) {
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