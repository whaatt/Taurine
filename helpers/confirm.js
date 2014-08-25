var nodemailer = require('nodemailer');
var fs = require('fs'); //read files
var tools = require('underscore');
var packInfo = require('../package.json');

//send confirmation
module.exports = {

    send : function(email, parameters) {
        //create reusable transporter object using SMTP
        var transporter = nodemailer.createTransport(sendmailTransport({
            path: '/usr/sbin/sendmail' //default to sendmail transport
        }));
        
        parameters.appName = packInfo.name;
        var appName = packInfo.name; //subject
        var adminName = packInfo.admin; //admin
        var adminMail = packInfo.email; //email
        
        //change the name in the package file as needed
        var subject = 'Confirm ' + appName + ' Registration';
        
        var textPath = __dirname + '/../views/mail/text.txt';
        var richPath = __dirname + '/../views/mail/rich.txt';
        
        fs.readFile(textPath, 'utf8', function(error, data) {
            if (error) {
                return false;
            }
            
            //render completed email using mustache cues
            var textMail = mustache.render(data, parameters);
      
            fs.readFile(richPath, 'utf8', function(error, data) {
                if (error) {
                    return false;
                }
                
                //render completed email using mustache cues
                var richMail = mustache.render(data, parameters);

                var mailOptions = {
                    from: adminName + ' <' + adminMail + '>',
                    to: email,
                    subject: subject,
                    text: textMail,
                    html: richMail
                };

                // send mail with the transport object defined above
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        return false;
                    }
                    
                    else {
                        return true;
                    }
                });
            });
        });
    }
    
}