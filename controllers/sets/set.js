//load all the external modules once
var helpers = require('../../helpers/index');
var moment = require('moment'); //datetime
var async = require('async'); //argh
var tools = require('underscore');

var DB = helpers.DB; //brevity
var validate = helpers.validate;
var response = helpers.response;
var error = helpers.error

var members = require('./members');
var tossups = require('./tossups');
var bonuses = require('./bonuses');
var packets = require('./packets');

module.exports = {

    members : members,
    tossups : tossups,
    bonuses : bonuses,
    packets : packets,
    
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
            
            else if (doc ===  null) {
                res.status(200).send(response(false, {
                    errors : [error.noPerms]
                })); return false;
            }
            
            else {
                DB.sets.findOne({'_id' : SID}, function(err, set) {
                    if (err) { console.log(err); throw err; }
                    
                    DB.getUserByID(set.directorID, function(err, user) {
                        if (err) { console.log(err); throw err; }
                        
                        set.directorName = user.name;
                        set.directorUsername = user.username;
                        set.ID = set['_id']; delete set['_id'];
                        
                        res.status(200).send(response(true, {set : set}));
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
        
        DB.permissions.findOne({userID : UID, '_id' : SID}, function(err, doc) {
            if (err) { console.log(err); throw err; }
            
            else if (doc ===  null) {
                res.status(200).send(response(false, {
                    errors : [error.noPerms]
                })); return false;
            }
            
            else {                
                var subjects = doc.subjects;
                var editSet = {}; //built up
                
                if ('name' in req.body && req.body.name !== '') {        
                    if (!validate.isLength(req.body.name, 2, 200)) {
                        res.status(200).send(response(false, {
                            errors : [error.length],
                            errorParams : ['name']
                        })); return false;
                    }
                    
                    else {
                        editSet.name = req.body.name;
                    }
                }
                
                if ('password' in req.body && req.body.password !== '') {        
                    if (!validate.isLength(req.body.password, 4, 40)) {
                        res.status(200).send(response(false, {
                            errors : [error.length],
                            errorParams : ['password']
                        })); return false;
                    }
                    
                    else {
                        editSet.password = req.body.password;
                    }
                }
                
                if ('info' in req.body && req.body.info !== '') {
                    if (!validate.isLength(req.body.info, 1, 1000)) {
                        res.status(200).send(response(false, {
                            errors : [error.length],
                            errorParams : ['info']
                        })); return false;
                    }
                    
                    else {
                        editSet.info = req.body.info;
                    }
                }
                
                if ('visibility' in req.body) {
                    if ([true, false].indexOf(req.body.visibility) === -1) {
                        editSet.visibility = false; //default to private set
                    }
                    
                    else {
                        editSet.visibility = req.body.visibility;
                    }
                }
                
                if ('schema' in req.body) {
                    //in the future this might change if I write a way to have arbitary schemas
                    if (['ACF', 'NSB', 'RCSB', 'RCQB'].indexOf(req.body.schema) === -1) {
                        res.status(200).send(response(false, {
                            errors : [error.badSchema]
                        })); return false;
                    }
                    
                    else {
                        editSet.schema = req.body.schema;
                    }
                }
                
                if ('config' in req.body) {
                    editSet.config = [0, 0, 0];
                    if (validate.isInt(req.body.config[0]) &&
                        parseInt(req.body.config[0]) > 0 &&
                        parseInt(req.body.config[0]) <= 1000) {
                        editSet.config[0] = parseInt(req.body.config[0]);
                    }
                    
                    if (validate.isInt(req.body.config[1]) &&
                        parseInt(req.body.config[1]) > 0 &&
                        parseInt(req.body.config[1]) <= 1000) {
                        editSet.config[1] = parseInt(req.body.config[1]);
                    }
                    
                    if (validate.isInt(req.body.config[2]) &&
                        parseInt(req.body.config[2]) > 0 &&
                        parseInt(req.body.config[2]) <= 1000) {
                        editSet.config[2] = parseInt(req.body.config[2]);
                    }
                }
                
                if ('target' in req.body && req.body.target !== '') {
                    var dateTarget = moment(req.body.target, 'YYYY-MM-DD HH:mm:ss');
                    if (!dateTarget.isValid()) {
                        res.status(200).send(response(false, {
                            errors : [error.badDate]
                        })); return false;
                    }
                    
                    else {
                        editSet.targetDate = dateTarget.format('YYYY-MM-DD HH:mm:ss');
                    }
                }
                
                //store subjects
                var subjects = []
                
                //process new subjects from request
                if ('subjectsAdd' in req.body &&
                    Array.isArray(req.body.subjectsAdd) === true) {
                    var subjectNameError = false;
                    var subjectNumberError = false;
                    
                    tools.each(req.body.subjectsAdd, function(subject) {
                        if (subject.length !== 3) return false;
                        else if (typeof subject[0] !== 'string' ||
                            typeof subject[1] !== 'number' ||
                            typeof subject[2] !== 'number') return false;
                        
                        else if (!validate.isLength(subject[0], 1, 50)) {
                            subjectNameError = true;
                            return false;
                        }
                        
                        else if (subject[1] < 0 || subject[1] > 1000 ||
                            subject[2] < 0 || subject[2] > 1000) {
                            subjectNumberError = true;
                            return false;
                        }
                        
                        else {
                            //truncate, not round, to two decimal places
                            subject[1] = Math.floor(subject[1] * 100) / 100;
                            subject[2] = Math.floor(subject[2] * 100) / 100;
                            subjects.push(subject); //add to list of valid subjects
                        }
                    });
                    
                    if (subjectNameError) {
                        res.status(200).send(response(false, {
                            errors : [error.badSubjectName]
                        })); return false;
                    }
                    
                    else if (subjectNumberError) {
                        res.status(200).send(response(false, {
                            errors : [error.badSubjectNumbers]
                        })); return false;
                    }
                }
                
                //store subjects for update
                var subjectsUpdate = [];
                
                //process update subjects from request
                if ('subjectsUpdate' in req.body &&
                    Array.isArray(req.body.subjectsUpdate) === true) {
                    var subjectNameError = false;
                    var subjectNumberError = false;
                    
                    tools.each(req.body.subjectsUpdate, function(subject) {
                        if (subject.length !== 4) return false;
                        else if (typeof subject[1] !== 'string' ||
                            typeof subject[2] !== 'number' ||
                            typeof subject[3] !== 'number') return false;
                        
                        else if (!validate.isLength(subject[1], 1, 50)) {
                            subjectNameError = true;
                            return false;
                        }
                        
                        else if (subject[2] < 0 || subject[2] > 1000 ||
                            subject[3] < 0 || subject[3] > 1000) {
                            subjectNumberError = true;
                            return false;
                        }
                        
                        else {
                            //truncate, not round, to two decimal places
                            subject[2] = Math.floor(subject[2] * 100) / 100;
                            subject[3] = Math.floor(subject[3] * 100) / 100;
                            subjectsUpdate.push(subject); //add to update list
                        }
                    });
                    
                    if (subjectNameError) {
                        res.status(200).send(response(false, {
                            errors : [error.badSubjectName]
                        })); return false;
                    }
                    
                    else if (subjectNumberError) {
                        res.status(200).send(response(false, {
                            errors : [error.badSubjectNumbers]
                        })); return false;
                    }
                }
                
                //store subjects for removal
                var subjectsRemove = [];
                
                //process update subjects from request
                if ('subjectsRemove' in req.body &&
                    Array.isArray(req.body.subjectsRemove) === true) {
                    var isMalformed = false;
                    
                    tools.each(req.body.subjectsRemove, function(subject) {
                        if (typeof subject !== 'number') {
                            isMalformed = true;
                        }
                    });
                    
                    if (isMalformed === false) {
                        subjectsRemove = req.body.subjectsRemove;
                    }
                }
                
                //IDs for set entry
                var subjects = [];
                
                async.waterfall([
                    //add new subjects
                    function(callback) {
                        async.eachSeries(subjectsAdd, function(subject, next) {
                            DB.getNewID('subjects', function(err, ID) {
                                if (err) { console.log(err); throw err; }
                                
                                //add to array of subject IDs
                                subjects.push(ID);
                                
                                var subjectAdd = {
                                    _id : ID,
                                    setID : SID,
                                    subject : subject[0],
                                    countTU : subject[1],
                                    countB : subject[2]
                                };
                                
                                DB.subjects.insert(subjectAdd, function(err, doc) {
                                    if (err) { console.log(err); throw err; }
                                    next();
                                });
                            });
                        }, callback);
                    },
                    
                    //update existing subjects
                    function(callback) {
                        async.eachSeries(subjectsUpdate, function(subject, next) {
                            var targetSubject = {
                                '_id' : subject[0],
                                setID : SID                                
                            };
                            
                            var updateSubject = {$inc : {
                                subject : subject[1],
                                countTU : subject[2],
                                countB : subject[3]  
                            }};
                            
                            DB.subjects.update(targetSubject, updateSubject, function(err, num) {
                                if (err) { console.log(err); throw err; }
                                
                                if (num === 0) {
                                    res.status(200).send(response(false, {
                                        errors : [error.noSuchSubject]
                                    })); return false
                                }
                                
                                else {
                                    next();
                                }
                            });
                        }, callback);
                    },
                    
                    //delete old subjects
                    function(callback) {
                        subjects = tools.without(subjects, subject);
                        async.eachSeries(subjectsRemove, function(subject, next) {
                            async.waterfall([
                                function(callback) {
                                    var targetSub = {
                                        '_id' : subject,
                                        setID : SID
                                    };
                                    
                                    DB.subjects.remove(targetSub, {}, function(err, num) {
                                        if (err) { console.log(err); throw err; }
                                        
                                        if (num === 0) {
                                            res.status(200).send(response(false, {
                                                errors : [error.noSuchSubject]
                                            })); return false
                                        }
                                        
                                        else {
                                            callback(null);
                                        }
                                    });
                                },
                                
                                //remove subject from tossups
                                function(callback) {
                                    var targetTUs = {subjectID : subject};
                                    var upd = {$set : {subjectID : null}};
                                    DB.tossups.update(targetTUs, upd, function(err, num) {
                                        if (err) { console.log(err); throw err; }
                                        callback(null);
                                    });
                                },
                                
                                //remove subject from bonuses
                                function(callback) {
                                    var targetBs = {subjectID : subject}
                                    var upd = {$set : {subjectID : null}};
                                    DB.bonuses.update(targetBs, upd, function(err, num) {
                                        if (err) { console.log(err); throw err; }
                                        callback(null);
                                    });
                                }
                            ], next);
                        }, callback);
                    },
                    
                    function(callback) {
                        editSet.subjects = subjects;
                        var update = {$set : editSet}
                        
                        DB.sets.update({'_id' : SID}, update, function(err, num) {
                            if (err) { console.log(err); throw err; }
                            
                            else if (num === 0) {
                                res.status(200).send(response(false, {
                                    errors : [error.noSuchSet]
                                })); return false;
                            }
                            
                            else {
                                res.status(200).send(response(true, {}));
                            }
                        });
                    }
                ]);
            }
        });
    },
    
    remove : function(req, res) {
    
    },
    
    role : function(req, res) {
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
                res.status(200).send(response(true, {role : doc.role}));
            }
        });
    },
    
    schema : function(req, res) {
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
                DB.sets.findOne({'_id' : SID}, function(err, doc) {
                    if (err) { console.log(err); throw err; }
            
                    else if (doc === null) {
                        res.status(200).send(response(false, {
                            errors : [error.noSuchSet]
                        })); return false;
                    }
                    
                    else {                      
                        res.status(200).send(response(true, {schema : doc.schema}));
                    }
                });
            }
        });
    },
    
    subjects : function(req, res) {
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
                DB.subjects.find({setID : SID}, function(err, docs) {
                    if (err) { console.log(err); throw err; }
            
                    else if (docs.length === 0) {
                        //set has no subjects
                        var subjects = [];
                        
                        res.status(200).send(response(true, {subjects : subjects}));
                    }
                    
                    else {                      
                        var subjects = _.each(docs, function(subject) {
                            return [
                                subject['_id'],
                                subject.subject,
                                subject.countTU, 
                                subject.countB
                            ];
                        });
                        
                        res.status(200).send(response(true, {subjects : subjects}));
                    }
                });
            }
        });
    },
    
    stats : function(req, res) {
    
    }

}