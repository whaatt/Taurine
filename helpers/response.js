var entities = require('html-entities');
var traverse = require('traverse');

module.exports = function(disposition, data, preserve) {
    if (typeof preserve === 'undefined' || preserve === false) {
        var checker = new entities.XmlEntities();
        var scrubbed = traverse(data).map(function(value) {
            if (typeof value === 'string') this.update(checker.encode(value));
        });
    }
    
    return {
        'success' : disposition,
        'data' : data
    }
}