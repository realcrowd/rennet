var Rule = require('../Rule');
var Q = require('q');

var AlwaysOffRule = function () { };
AlwaysOffRule.prototype = new Rule();

AlwaysOffRule.prototype.evaluate = function(context) {
    return Q(false);
};

module.exports = AlwaysOffRule;