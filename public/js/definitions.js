var errors = {
    alreadyConfirmed : 'This registration has already been confirmed!',
    alreadyLoggedIn : 'You cannot perform this action while logged in.',
    blank : function(name) { return 'Your ' + name + ' parameter cannot be blank! Please try again.' },
    database : 'An unknown database error occurred. Please try again.',
    duplicate : 'That username is already taken! Please try again.',
    mail : 'An unknown mail error occurred. Please contact your system administrator.',
    missingParams : 'One or more parameters was missing from your request. Please try again.',
    notConfirmed : 'This username has not been properly confirmed. Please check your email.',
    noSuchConfirm : 'No such confirmation ID exists. Please try again.',
    noSuchCreds : 'No such user credentials exist. Please try again.',
    parameter : function(name) { return 'Your ' + name + ' parameter did not adhere to its requirements. Please try again.' },
    passwordConfirm : 'Your confirmation did not match your password. Please try again.',
    validMail : 'You must enter a valid email. Please try again.'
};

var success = {
    confirm : 'Your registration was successfully confirmed. You may now log in.',
    forgot : 'Please check your email for the information you requested.',
    login : 'You have successfully logged in.',
    register : 'Please check your email to confirm your registration.'
};

function addErrors(errorList, errorParams) {
    if (typeof errorParams !== 'undefined') {
        for (var i = 0; i < errorList.length; i++){
            addError(errors[errorList[i]](errorParams[i]));
        }
    }
    
    else {
        _.each(errorList, function(val) {
            addError(errors[val]);
        });
    }
}