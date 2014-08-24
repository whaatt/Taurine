var validate = require('validator');
var response = require('./response');
var database = require('./database');
var confirm = require('./confirm');
var error = require('./error');

module.exports = {

    validate: validate,
    DB : database,
    confirm : confirm,
    error : error,
    response : response

}