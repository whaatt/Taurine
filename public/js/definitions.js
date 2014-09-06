var errors = {
    alreadyConfirmed : 'This registration has already been confirmed!',
    alreadyLoggedIn : 'You cannot access this resource while logged in.',
    alreadySetMember : 'You are already a member of this set.',
    badDate : 'Your provided target date was invalid. Please try again.',
    badSchema : 'Your provided schema type was invalid. Please try again.',
    badSubjectName : 'One or more of your subject names was too long. Please try again.',
    badSubjectNumbers : 'One or more of your subject question numbers was invalid or too large. Please try again.',
    blank : function(name) { return 'Your ' + name + ' parameter cannot be blank. Please try again.'; },
    cannotEditSelf : 'You cannot edit your own member information.',
    currentlyAssigned : 'This question is currently assigned to a packet. Your action is invalid.',
    database : 'An unknown database error occurred. Please try again.',
    duplicate : 'That username is already taken! Please try again.',
    issuesExist : 'There are currently unresolved issues with this question. Please resolve them first.',
    length : function(name) { return 'Your ' + name + ' parameter was too long or too short. Please try again.'; },
    mail : 'An unknown mail error occurred. Please contact your system administrator.',
    missingParams : 'One or more parameters was missing from your request. Please try again.',
    noConfirm : 'You must confirm your password. Please try again.',
    notConfirmed : 'This username has not been properly confirmed. Please check your email.',
    notLoggedIn : 'You must be logged in to access this resource. Please log in.',
    noPerms : 'You do not have permission to access this resource.',
    noPermsAction : 'You have insufficient permissions to perform this action. Please contact your set director.',
    noSuchBonus : 'No such bonus exists. Please try again.',
    noSuchConfirm : 'No such confirmation ID exists. Please try again.',
    noSuchCreds : 'No such user credentials exist. Please try again.',
    noSuchMember : 'No such member belongs to this set. Please try again.',
    noSuchNotification : 'No corresponding notification was found. Please try again.',
    noSuchSet : 'The specified set was not found. Please try again.',
    noSuchSubject : 'One or more of your specified subjects does not exist.',
    noSuchTossup : 'No such tossup exists. Please try again.',
    parameter : function(name) { return 'Your ' + name + ' parameter did not adhere to its requirements. Please try again.'; },
    passwordConfirm : 'Your confirmation did not match your password. Please try again.',
    validMail : 'You must enter a valid email. Please try again.',
    wrongSetPassword : 'Your password for the given set was incorrect. Please try again.'
};

var success = {
    account : 'Your account information has been updated.',
    del : 'Your set was successfully deleted. Hope you meant to do that.',
    confirm : 'Your registration was successfully confirmed. You may now log in.',
    create : 'Your set has been successfully created. Please visit the dashboard.',
    edit : 'Your set has been successfully edited. Please reload to edit again.',
    forgot : 'Please check your email for the information you requested.',
    join : 'You have successfully joined this set. Please visit the dashboard.',
    login : 'You have successfully logged in.',
    logout : 'You have successfully logged out.',
    redir : 'You are already logged in.',
    register : 'Please check your email to confirm your registration.'
};

function addErrors(errorList, errorParams) {
    if (typeof errorParams !== 'undefined') {
        for (var i = 0; i < errorList.length; i++){
            if (typeof errors[errorList[i]] === 'function'){
                addError(errors[errorList[i]](errorParams[i]));
            }
            
            else {
                addError(errors[errorList[i]]);
            }
        }
    }
    
    else {
        _.each(errorList, function(val) {
            addError(errors[val]);
        });
    }
}