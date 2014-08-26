module.exports = {
    alreadyLoggedIn : 'You cannot perform this action while logged in.',
    database : 'An unknown database error occurred. Please try again.',
    duplicate : 'That username is already taken! Please try again.',
    mail : 'Your confirmation email could not be sent. Please contact your system administrator.',
    missingParams : 'One or more parameters was missing from your request. Please try again.',
    parameter : function(name) { return 'Your ' + name + ' parameter did not adhere to its requirements. Please try again.' }
}