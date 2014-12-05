var Rule = require('../Rule');
var Q = require('q');

var AlwaysOffRule = function (obj) {
    this.name = "AlwaysOffRule";
    this.arguments = {};

    for (var prop in obj) {
        this[prop] = obj[prop];
    }
};

AlwaysOffRule.prototype = new Rule();

AlwaysOffRule.prototype.evaluate = function(context) {
    return Q(false);
};

module.exports = AlwaysOffRule;