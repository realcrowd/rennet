var Rule = require('../Rule');
var jsonPathEngine = require('JSONPath');

var StringMatchesRule = function () { };
StringMatchesRule.prototype = new Rule();

StringMatchesRule.prototype.arguments = {
    jsonPath: '',   //Where on the context this value lives (https://github.com/s3u/JSONPath)
    matches: ''     //Regex match for the value
};

StringMatchesRule.prototype.evaluate = function (context) {
    var args = this.arguments;
    return Q.fcall(function() {
        var propertyToEvaluate = jsonPathEngine.eval(context, args.jsonPath);
        return String(propertyToEvaluate).match(args.matches) !== null;
    });
};

module.exports = StringMatchesRule;