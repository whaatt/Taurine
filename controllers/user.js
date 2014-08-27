//load all the external modules once
var helpers = require('../helpers/index');
var async = require('async'); //argh
var tools = require('underscore');

var DB = helpers.DB; //brevity
var validate = helpers.validate;
var response = helpers.response;
var success = helpers.success
var error = helpers.error

module.exports = {

    create : function(req, res) {
        if ((!('username' in req.body)) ||
            (!('password' in req.body)) ||
            (!('confirm' in req.body)) ||
            (!('email' in req.body)) ||
            (!('name' in req.body))) {
            res.status(200).send(response(false, {
                errors : [error.missingParams]
            })); return false;
        }
            
        var username = req.body.username;
        var password = req.body.password;
        var confirm = req.body.confirm;
        var email = req.body.email;
        var name = req.body.name;
        
        if ((!validate.isLength(username, 3, 20)) ||
            (!validate.isAlphanumeric(username))) {
            res.status(200).send(response(false, {
                errors : [error.parameter],
                errorParams : ['username']
            })); return false;
        }
        
        if (!validate.isLength(password, 8, 40)) {
            res.status(200).send(response(false, {
                errors : [error.parameter],
                errorParams : ['password']
            })); return false;
        }
        
        if (password !== confirm) {
            res.status(200).send(response(false, {
                errors : [error.passwordConfirm]
            })); return false;
        }
        
        if ((!validate.isLength(name, 1, 60))) {
            res.status(200).send(response(false, {
                errors : [error.parameter],
                errorParams : ['name']
            })); return false;
        }
        
        if (!validate.isLength(email, 6, 200)) {
            res.status(200).send(response(false, {
                errors : [error.parameter],
                errorParams : ['email']
            })); return false;
        }
        
        if (!validate.isEmail(email)) {
            res.status(200).send(response(false, {
                errors : [error.validMail]
            })); return false;
        }
        
        DB.users.find({username : username}, function(err, docs) {
            if (err) {
                res.status(200).send(response(false, {
                    errors : [error.database]
                })); return false;
            }
            
            else {
                if (docs.length > 0) {
                    res.status(200).send(response(false, {
                        errors : [error.duplicate]
                    })); return false;
                }
            }
        
            var confirmID = ''; //ten
            for (var i = 0; i < 10; i++) { //allowed digits are one through nine
                confirmID += (Math.floor(Math.random() * (9 - 1 + 1)) + 1).toString();
            }
            
            var newUser = {
                username : username,
                password : password,
                email : email,
                name : name,
                confirmed : false,
                confirmID : parseInt(confirmID)
            }
            
            async.waterfall([
                function(callback) {
                    DB.hash(newUser.password, function(err, hash) {
                        newUser.password = hash;
                        callback(null);
                    });
                },
                
                function(callback) {
                    DB.getNewID('users', function(err, ID) {
                        newUser['_id'] = ID;
                        callback(null);
                    });
                },
                
                function(callback) {
                    DB.users.insert(newUser, function(err) {
                        if (err) {
                            res.status(200).send(response(false, {
                                errors : [error.database]
                            })); return false;
                        }
                        
                        else {
                            callback(null);
                        }
                    });
                },
                
                function(callback) {
                    helpers.mail.confirm(email, username, confirmID, function(err) {
                        /*if (err) {
                            DB.users.remove({username : username}, function(err, num) {
                                if (err) {
                                    res.status(200).send(response(false, {
                                        errors : [error.database]
                                    })); return false;
                                }
                                
                                else {            
                                    res.status(200).send(response(false, {
                                        errors : [error.mail]
                                    })); return false
                                }
                            });
                        }
                        
                        else {      
                            res.status(200).send(response(true, {}));
                            return true; //everything worked yay
                        }*/
                    });
                    
                    //if the email fails we will just log it
                    res.status(200).send(response(true, {}));
                }
            ]);
        });
    },
    
    confirm : function(req, res) {
        var UID = req.params.UID;
        var CID = req.params.CID;
        
        var target = {
            '_id' : parseInt(UID), 
            confirmID : parseInt(CID)
        };
        
        DB.users.find(target, function(err, docs) {
            if (err) {
                res.status(200).send(response(false, {
                    errors : [error.database]
                })); return false;
            }
            
            else {
                if (docs.length <= 0) {
                    res.status(200).send(response(false, {
                        errors : [error.noSuchConfirm]
                    })); return false;
                }
                
                else {
                    if (docs[0].confirmed !== false) {
                        res.status(200).send(response(false, {
                            errors : [error.alreadyConfirmed]
                        })); return false;
                    }
                    
                    else {
                        DB.users.update(target, {$set : {confirmed : true}}, function(err, num) {
                            if (err) {
                                res.status(200).send(response(false, {
                                    errors : [error.database]
                                })); return false;
                            }
                            
                            else {
                                //confirm our confirmation update
                                res.status(200).send(response(true, {}));
                            }
                        });
                    }
                }
            }
        });
    },
    
    login : function(req, res) {
        if ((!('username' in req.body)) ||
            (!('password' in req.body))) {
            res.status(200).send(response(false, {
                errors : [error.missingParams]
            })); return false;
        }
        
        var username = req.body.username;
        var password = req.body.password;
        
        DB.users.find({username : username}, function(err, docs) {
            if (err) {
                res.status(200).send(response(false, {
                    errors : [error.database]
                })); return false;
            }
            
            else {
                if (docs.length > 0) {
                    DB.verify(password, docs[0].password, function(err, correct) {
                        if (correct === true) {
                            if (docs[0].confirmed === true) {
                                req.session.authorized = false;
                                req.session.ID = docs[0]['_id'];
                                req.session.username = docs[0].username;
                                        
                                res.status(200).send(response(true, {}));
                                return true;
                            }
                            
                            else {
                                res.status(200).send(response(false, {
                                    errors : [error.notConfirmed]
                                }));
                                
                                DB.users.update({username : username}, {$unset : {temporary : true}}, function() {
                                    //we do not care about the error here
                                }); return true;
                            }
                        }
                        
                        else {
                            DB.verify(password, docs[0].temporary, function(err, correct) {
                                if (correct === true) {
                                    if (docs[0].confirmed === true) {
                                        req.session.authorized = false;
                                        req.session.ID = docs[0]['_id'];
                                        req.session.username = docs[0].username;
                                        
                                        res.status(200).send(response(true, {}));
                                        return true;
                                    }
                                    
                                    else {
                                        res.status(200).send(response(false, {
                                            errors : [error.notConfirmed]
                                        })); return false;
                                    }
                                }
                                
                                else {
                                    res.status(200).send(response(false, {
                                        errors : [error.noSuchCreds]
                                    })); return false;
                                }
                            });
                        }
                    });
                }
                
                else {
                    res.status(200).send(response(false, {
                        errors : [error.noSuchCreds]
                    })); return false;
                }
            }
        });
    },
    
    logout : function(req, res) {
    
    },
    
    forgot : function(req, res) {
        if (!('email' in req.body)) {
            res.status(200).send(response(false, {
                errors : [error.missingParams]
            })); return false;
        }
        
        if (req.body.email === '') {
            res.status(200).send(response(false, {
                errors : [error.blank],
                errorParams : ['email']
            })); return false;
        }
        
        if (!validate.isEmail(req.body.email)) {
            res.status(200).send(response(false, {
                errors : [error.validMail]
            })); return false;
        }
        
        if ('username' in req.body &&
            req.body.username !== '') {
            var email = req.body.email;
            var username = req.body.username;
            
            DB.users.find({email : email, username : username}, function(err, docs) {
                if (err) {
                    res.status(200).send(response(false, {
                        errors : [error.database]
                    })); return false;
                }
                
                else {
                    if (docs.length <= 0) {
                        res.status(200).send(response(false, {
                            errors : [error.noSuchCreds]
                        })); return false;
                    }
                    
                    else {
                        var randomPass = DB.random();
                        DB.hash(randomPass, function(err, hash) {
                            DB.users.update({username : username}, {$set : {temporary : hash}}, function(err, num){
                                if (err) {
                                    res.status(200).send(response(false, {
                                        errors : [error.database]
                                    })); return false;
                                }
                                
                                else {
                                    helpers.mail.password(email, username, randomPass, function(err) {
                                        //do nothing for now
                                    });
                                    
                                    res.status(200).send(response(true, {}));
                                }
                            });
                        });
                    }
                }
            });
        }
        
        else {
            //forgot usernames
            var email = req.body.email;
            
            DB.users.find({email : email}, function(err, docs) {
                if (err) {
                    res.status(200).send(response(false, {
                        errors : [error.database]
                    })); return false;
                }
                
                else {
                    if (docs.length <= 0) {
                        res.status(200).send(response(false, {
                            errors : [error.noSuchCreds]
                        })); return false;
                    }
                    
                    else {
                        var usernames = tools.pluck(docs, 'username'); //underscore FTW                        
                        helpers.mail.username(email, usernames, function(err) {
                            //do nothing for now
                        });
                        
                        res.status(200).send(response(true, {}));
                    }
                }
            });
        }
    },
    
    info : function(req, res) {
        if (req.session.authorized !== true) {
            
        }
    },
    
    edit : function(req, res) {
    
    }
    
}