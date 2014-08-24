//load all the external modules once
var helpers = require('../helpers/index');

var DB = helpers.DB; //brevity
var validate = helpers.validate;
var response = helpers.response;
var error = helpers.error

//get subsidiary controllers
var set = require('./sets/set')

module.exports = {

    set : set,
    
    all : function(req, res) {
    
    },
    
    create : function(req, res) {
    
    }

}