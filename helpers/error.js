module.exports = {
    alreadyConfirmed : 'alreadyConfirmed', //registration already confirmed
    alreadyLoggedIn : 'alreadyLoggedIn', //cannot be logged in
    alreadySetMember : 'alreadySetMember', //user already belongs to set
    badDate : 'badDate', //provided date was invalid
    badSchema : 'badSchema', //schema type is invalid
    badSubjectName : 'badSubjectName', //subject name is invalid
    badSubjectNumbers : 'badSubjectNumbers', //subject numbers are invalid
    blank : 'blank', //<parameter> is blank
    cannotEditSelf : 'cannotEditSelf', //user is trying to edit own member info
    database : 'database', //database error occurrred
    duplicate : 'duplicate', //duplicate username
    length : 'length', //<parameter> is too long or too short
    mail : 'mail', //unknown mail error
    missingParams : 'missingParams', //missing parameters from request
    noConfirm : 'noConfirm', //no password confirmation included
    notConfirmed : 'notConfirmed', //username has not been confirmed
    notLoggedIn : 'notLoggedIn', //user is not logged in
    noPerms : 'noPerms', //user does not have permissions for resource
    noSuchConfirm : 'noSuchConfirm', //confirmation ID does not exist
    noSuchCreds : 'noSuchCreds', //given credentials do not match anything
    noSuchMember : 'noSuchMember', //given member does not exist in set
    noSuchSet : 'noSuchSet', //given set ID does not exist in DB
    noSuchSubject : 'noSuchSubject', //specified subject is not accessible
    parameter : 'parameter', //<parameter> is improperly provided
    passwordConfirm : 'passwordConfirm', //confirm did not match password
    validMail : 'validMail', //valid email is required
    wrongSetPassword : 'wrongSetPassword' //set password was incorrect
}