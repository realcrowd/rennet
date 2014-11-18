var Rule = require('../Rule');
var jsonPathEngine = require('JSONPath');
var Q = require('q');

var StringMatchesRule = function () { };
StringMatchesRule.prototype = new Rule();

StringMatchesRule.prototype.arguments = {
    jsonPath: '',   //Where on the context this value lives (https://github.com/s3u/JSONPath)
    matches: ''     //Regex match for the value
};

StringMatchesRule.prototype.evaluate = function (context) {
    var args = this.arguments;
    return Q.fcall(function() {
        var matchingNodes = jsonPathEngine.eval(context, args.jsonPath);

        if (matchingNodes.length == 0) {
            throw new Error('Nothing found in context at "' + applyAtJsonPath + '". Unable to apply patch.')
        }

        //make sure the strings all match
        //todo: make this behavior configurable
        var len = matchingNodes.length;
        for (var i = 0; i < len; i++) {
            if (String(matchingNodes[i]).match(args.matches) === null) {
                return false;
            }
        }

        return true;
    });
};

module.exports = StringMatchesRule;