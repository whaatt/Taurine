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
        
        var SID = parseInt(req.params.SID);
        var UID = req.session.ID;
        
        DB.permissions.findOne({setID : SID, userID : UID}, function(err, doc) {
            if (err) { console.log(err); throw err; }
            
            else if (doc === null) {
                res.status(200).send(response(false, {
                    errors : [error.noPerms]
                })); return false;
            }
            
            else {
                var members = [];
                DB.permissions.find({setID : SID}, function(err, docs) {
                    if (err) { console.log(err); throw err; }
                    async.eachSeries(docs, function(doc, next) {
                        var member = {
                            MID : doc.userID,
                            role : doc.role,
                            focus : []
                        };
                        
                        async.waterfall([
                            function(callback) {
                                async.eachSeries(doc.focus, function(subject, next) {
                                    DB.subjects.findOne({'_id' : subject}, function(err, doc) {
                                        if (err) { console.log(err); throw err; }
                                        
                                        member.focus.push([
                                            doc['_id'],
                                            doc.subject,
                                            doc.countTU,
                                            doc.countB
                                        ]);
                                        
                                        next();
                                    });
                                }, callback);
                            },
                            
                            function(callback) {
                                DB.users.findOne({'_id' : doc.userID}, function(err, doc) {
                                    if (err) { console.log(err); throw err; }
                                    
                                    member.name = doc.name;
                                    member.username = doc.username;
                                    members.push(member); //add member
                                    
                                    next();
                                });
                            }
                        ]);
                    }, function() {
                        res.status(200).send(response(true, {members : members}));
                    });
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
        
        var UID = req.session.ID;
        var SID = parseInt(req.params.SID);
        var MID = parseInt(req.params.MID);
        
        var targetPerm = {
            userID : UID,
            setID : SID,
            role : {$in : [
                'Director',
                'Administrator'
            ]}
        };
        
        DB.permissions.findOne(targetPerm, function(err, doc) {
            if (err) { console.log(err); throw err; }
            
            else if (doc ===  null) {
                res.status(200).send(response(false, {
                    errors : [error.noPerms]
                })); return false;
            }
            
            else {
                targetPerm = {setID : SID, userID : MID};
                DB.permissions.findOne(targetPerm, function(err, doc) {
                    if (err) { console.log(err); throw err; }
                    
                    else if (doc === null) {
                        res.status(200).send(response(false, {
                            errors : [error.noSuchMember]
                        })); return false;
                    }
                    
                    else if (MID === UID) {
                        res.status(200).send(response(false, {
                            errors : [error.cannotEditSelf]
                        })); return false;
                    }
                    
                    else {
                        var edit = {
                            role : doc.role,
                            focus : []
                        }
                        
                        if ('role' in req.body) {
                            var validRoles = [
                                'Administrator',
                                'Editor',
                                'Writer'
                            ];
                            
                            if (validRoles.indexOf(req.body.role) === -1) {
                                if (doc.role === 'Director' &&
                                    req.body.role === 'Director') {
                                    //do nothing
                                }
                                
                                else {
                                    res.status(200).send(response(false, {
                                        errors : [error.parameter],
                                        errorParams : ['role']
                                    })); return false;
                                }
                            }
                            
                            else {
                                edit.role = req.body.role;
                            }
                        }
                        
                        if ('focus' in req.body &&
                            Array.isArray(req.body.focus) === true) {
                            if (edit.role !== 'Editor') {
                                DB.permissions.update({setID : SID, userID : MID}, {$set : edit}, {}, function(err, num) {
                                    if (err) { console.log(err); throw err; }
                                    res.status(200).send(response(true, {}));
                                });
                            }
                            
                            else {
                                async.eachSeries(req.body.focus, function(subject, next) {
                                    var target = {setID : SID, '_id' : subject};
                                    DB.subjects.findOne(target, function(err, doc) {
                                        if (err) { console.log(err); throw err; }
                                        
                                        else if (doc === null) {
                                            res.status(200).send(response(false, {
                                                errors : [error.noSuchSubject]
                                            })); return false;
                                        }
                                        
                                        else {
                                            next();
                                        }
                                    });
                                }, function() {
                                    edit.focus = req.body.focus;
                                    DB.permissions.update({setID : SID, userID : MID}, {$set : edit}, {}, function(err, num) {
                                        if (err) { console.log(err); throw err; }
                                        res.status(200).send(response(true, {}));
                                    });
                                });
                            }
                        }
                        
                        else {
                            console.log(edit);
                            DB.permissions.update({setID : SID, userID : MID}, {$set : edit}, {}, function(err, num) {
                                if (err) { console.log(err); throw err; }
                                res.status(200).send(response(true, {}));
                            });
                        }
                    }
                });
            }
        });
    }

}