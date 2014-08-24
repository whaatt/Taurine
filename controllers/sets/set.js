//load all the external modules once
var helpers = require('../../helpers/index');

var DB = helpers.DB; //brevity
var validate = helpers.validate;
var response = helpers.response;
var error = helpers.error

var members = require('./members');
var tossups = require('./tossups');
var bonuses = require('./bonuses');
var packets = require('./packets');

module.exports = {

    members : members,
    tossups : tossups,
    bonuses : bonuses,
    packets : packets,
    
    info : function(req, res) {
    
    },
    
    edit : function(req, res) {
    
    },
    
    remove : function(req, res) {
    
    },
    
    role : function(req, res) {
    
    },
    
    schema : function(req, res) {
    
    },
    
    subjects : function(req, res) {
    
    },
    
    stats : function(req, res) {
    
    }

}