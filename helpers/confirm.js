var async = require('async'); //argh
var nodemailer = require('nodemailer');
var fs = require('fs'); //read files
var tools = require('underscore');
var packInfo = require('../package.json');

//send confirmation
module.exports = {

    confirm : function(email, username, CID, call) {
        //create reusable transporter object using SMTP
        var transporter = nodemailer.createTransport();
        
        var appName = packInfo.name; //subject
        var appRoot = packInfo.root; //subject
        var adminName = packInfo.admin; //admin
        var adminMail = packInfo.email; //email
        
        var parameters = {
            username : username,
            appName : appName,
            appRoot : appRoot,
            CID : CID
        }
        
        //change the name in the package file as needed
        var subject = 'Confirm ' + appName + ' Registration';
        
        var textPath = __dirname + '/../views/mail/confirm/text.txt';
        var richPath = __dirname + '/../views/mail/confirm/rich.txt';
        
        var textMail;
        var richMail;
        var mailOptions;
        
        async.series([
        
            function(callback) {
                fs.readFile(textPath, 'utf8', function(error, data) {
                    if (error) {
                        callback(error, '');
                    }
                    
                    else {
                        textMail = tools.template(data, parameters);
                        callback(null);
                    }
                });
            },
            
            function(callback) {
                fs.readFile(richPath, 'utf8', function(error, data) {
                    if (error) {
                        callback(error);
                    }
                    
                    else {                        
                        //render completed email using mustache cues
                        richMail = tools.template(data, parameters);

                        mailOptions = {
                            from: adminName + ' <' + adminMail + '>',
                            to: email,
                            subject: subject,
                            text: textMail,
                            html: richMail
                        };
                        
                        callback(null);
                    }
                });
            },
            
            function(callback) {
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        callback(error);
                    }
                    
                    else {
                        callback(null);
                    }
                });
            }
            
        ], function(error) {
            if (error) {
                call(error);
            }
            
            else {
                call(null);
            }
        });
    }
    
}