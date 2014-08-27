var validate = require('validator');
var response = require('./response');
var database = require('./database');
var error = require('./error');
var mail = require('./mail');

module.exports = {

    validate: validate,
    DB : database,
    mail : mail,
    error : error,
    response : response

}