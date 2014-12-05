var Rule = require('../Rule');
var jsonPathEngine = require('JSONPath');
var Q = require('q');

var StringMatchesRule = function (obj) {
    this.name = "StringMatchesRule";
    this.arguments = {};

    for (var prop in obj) {
        this[prop] = obj[prop];
    }
};
StringMatchesRule.prototype = new Rule();

StringMatchesRule.prototype.arguments = {
    jsonPath: '',   //Where on the context this value lives (https://github.com/s3u/JSONPath)
    matches: ''     //Regex match for the value
};

StringMatchesRule.prototype.evaluate = function (context) {
    var matchingNodes = jsonPathEngine.eval(context, this.arguments.jsonPath);

    if (matchingNodes.length == 0) {
        throw new Error('Nothing found in context at "' + applyAtJsonPath + '". Unable to apply patch.')
    }

    //make sure the strings all match
    //todo: make this behavior configurable
    var len = matchingNodes.length;
    for (var i = 0; i < len; i++) {
        if (String(matchingNodes[i]).match(this.arguments.matches) === null) {
            return Q(false);
        }
    }

    return Q(true);
};

module.exports = StringMatchesRule;