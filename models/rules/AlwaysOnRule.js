var Rule = require('../Rule');
var Q = require('q');

var AlwaysOnRule = function (obj) {
    this.name = "AlwaysOnRule";
    this.arguments = {};

    for (var prop in obj) {
        this[prop] = obj[prop];
    }
};

AlwaysOnRule.prototype = new Rule();

AlwaysOnRule.prototype.evaluate = function(context) {
    return Q(true);
};

module.exports = AlwaysOnRule;