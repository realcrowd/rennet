var Rule = require('../Rule');
var Q = require('q');

var AlwaysOffRule = function () { };
AlwaysOffRule.prototype = new Rule();

AlwaysOffRule.prototype.evaluate = function(context) {
    return Q.fcall(function() {
        return false;
    });
};

module.exports = AlwaysOffRule;