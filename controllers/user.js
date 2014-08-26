//load all the external modules once
var helpers = require('../helpers/index');
var async = require('async'); //argh
var crypto = require('crypto');

var DB = helpers.DB; //brevity
var validate = helpers.validate;
var response = helpers.response;
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
                errors : [error.parameter('username')]
            })); return false;
        }
        
        if ((!validate.isLength(password, 8, 40)) ||
            (password !== confirm)) {
            res.status(200).send(response(false, {
                errors : [error.parameter('password')]
            })); return false;
        }
        
        if ((!validate.isLength(name, 1, 60))) {
            res.status(200).send(response(false, {
                errors : [error.parameter('name')]
            })); return false;
        }
        
        if ((!validate.isLength(email, 6, 200)) ||
            (!validate.isEmail(email))) {
            res.status(200).send(response(false, {
                errors : [error.parameter('email')]
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
                    var salt = crypto.randomBytes(128).toString('base64');
                    crypto.pbkdf2(newUser.password, salt, 10000, 512, function(err, key) {
                        newUser.password = key;
                        newUser.salt = salt;
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
                    helpers.confirm.send(email, username, confirmID, function(err) {
                        if (err) {
                            console.log('Confirmation email did not send.');
                        }
                        
                        /*
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
        
    },
    
    login : function(req, res) {
    
    },
    
    logout : function(req, res) {
    
    },
    
    forgot : function(req, res) {
    
    },
    
    info : function(req, res) {
    
    },
    
    edit : function(req, res) {
    
    }
    
}