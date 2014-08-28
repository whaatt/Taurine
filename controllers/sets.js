//load all the external modules once
var helpers = require('../helpers/index');
var moment = require('moment'); //datetime
var tools = require('underscore');

var DB = helpers.DB; //brevity
var validate = helpers.validate;
var response = helpers.response;
var error = helpers.error;

//get subsidiary controllers
var set = require('./sets/set');

module.exports = {

    set : set,
    
    all : function(req, res) {
    
    },
    
    create : function(req, res) {
        if (req.session.authorized !== true) {
            res.status(200).send(response(false, {
                errors : [error.notLoggedIn]
            })); return false;
        }
        
        if (!('name' in req.body) ||
            !('password' in req.body)) {
            res.status(200).send(response(false, {
                errors : [error.missingParams]
            })); return false;
        }
        
        if (!validate.isLength(req.body.name, 2, 200)) {
            res.status(200).send(response(false, {
                errors : [error.parameter],
                errorParams : ['name']
            })); return false;
        }
        
        if (!validate.isLength(req.body.password, 4, 40)) {
            res.status(200).send(response(false, {
                errors : [error.parameter],
                errorParams : ['password']
            })); return false;
        }
        
        var newSet = {
            name : req.body.name,
            password : req.body.password,
            directorID : req.session.ID
        }
        
        if ('info' in req.body) {
            if (!validate.isLength(req.body.info, 0, 1000)) {
                res.status(200).send(response(false, {
                    errors : [error.parameter],
                    errorParams : ['info']
                })); return false;
            }
            
            else {
                newSet.info = req.body.info;
            }
        }
        
        else {
            //blank info
            newSet.info = '';
        }
        
        if ('visibility' in req.body) {
            if ([true, false].indexOf(req.body.visibility) === -1) {
                newSet.visibility = false; //default to private set
            }
            
            else {
                newSet.visibility = req.body.visibility;
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
                newSet.schema = req.body.schema;
            }
        }
        
        newSet.config = [0, 0, 0];
        if ('config' in req.body) {
            if (validate.isInt(req.body.config[0]) &&
                parseInt(req.body.config[0]) > 0) {
                newSet.config[0] = parseInt(req.body.config[0]);
            }
            
            if (validate.isInt(req.body.config[1]) &&
                parseInt(req.body.config[1]) > 0) {
                newSet.config[1] = parseInt(req.body.config[1]);
            }
            
            if (validate.isInt(req.body.config[2]) &&
                parseInt(req.body.config[2]) > 0) {
                newSet.config[2] = parseInt(req.body.config[2]);
            }
        }
        
        if ('target' in req.body) {
            var dateTarget = moment(req.body.target, 'YYYY-MM-DD HH:mm:ss');
            if (!dateTarget.isValid()) {
                res.status(200).send(response(false, {
                    errors : [error.badDate]
                })); return false;
            }
            
            else {
                newSet.targetDate = dateTarget;
            }
        }
        
        var dateNow = moment().format('YYYY-MM-DD HH:mm:ss');
        newSet.creationDate = dateNow;
        
        //store subjects
        var subjects = []
        
        //process subjects from request
        if ('subjects' in req.body &&
            req.body.subjects.isArray() === true) {
            var subjectNameError = false;
            var subjectNumberError = false;
            
            tools.each(req.body.subjects, function(subject) {
                if (subject.length < 3) return false;
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
        
        async.waterfall([
            function(callback) {
                DB.getNewID('sets', function(err, ID) {
                    if (err) {
                        res.status(200).send(response(false, {
                            errors : [error.database]
                        })); return false;
                    }
                    
                    newSet['_id'] = ID;
                    callback(null);
                });
            },
            
            function(callback) {
                tools.each(subjects, function(subject) {
                    DB.getNewID('subjects', function(err, ID) {
                        //add to subjects array for sets DB
                        subjects.push(ID); //subject[3]
                    
                        if (err) {
                            res.status(200).send(response(false, {
                                errors : [error.database]
                            })); callback(Error('error'));
                        }
                        
                        var subjectAdd = {
                            _id : ID,
                            setID : newSet['_id'],
                            subject : subject[0],
                            countTU : subject[1],
                            countB : subject[2]
                        };
                        
                        DB.subjects.insert(subjectAdd, function(err, doc) {
                            if (err) {
                                res.status(200).send(response(false, {
                                    errors : [error.database]
                                })); callback(Error());
                            }
                        });
                    });
                });
                
                //when each is done
                callback(null);
            },
            
            function(callback) {
                newSet.subjects = tools.map(subjects, function(subject) {
                    return subject[3]; //subject ID for sets DB
                });
                
                DB.sets.insert(newSet, function(err, doc) {
                    if (err) {
                        res.status(200).send(response(false, {
                            errors : [error.database]
                        })); return false;
                    }
                    
                    //whew! we made it through that mess
                    res.status(200).send(response(true, {}));
                });
            }
        ]);
    }

}