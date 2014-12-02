var Rule = require('../Rule');
var Q = require('q');

var AlwaysOnRule = function () { };
AlwaysOnRule.prototype = new Rule();

AlwaysOnRule.prototype.evaluate = function(context) {
    return Q(true);
};

module.exports = AlwaysOnRule;