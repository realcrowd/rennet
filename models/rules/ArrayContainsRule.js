var Rule = require('../Rule');
var jsonPathEngine = require('JSONPath');

var ArrayContainsRule = function () { };
ArrayContainsRule.prototype = new Rule();

ArrayContainsRule.prototype.arguments = {
    jsonPath: '',   //Where on the context this array lives
    matches: ''     //Regex match for the item in the array
};

ArrayContainsRule.prototype.evaluate = function (context) {
    var args = this.arguments;
    return Q.fcall(function () {
        var arrayToEvaluate = jsonPathEngine.eval(context, args.jsonPath);
        
        if (!Array.isArray(arrayToEvaluate)) {
            return false;
        }
        
        var rx = new RegExp(args.matches);
        var len = arrayToEvaluate.length;
        for (var i = 0; i < len; i++) {
            if (String(arrayToEvaluate[i]).match(rx) !== null) {
                return true;
            }
        }
        
        return false;
    });
};

module.exports = ArrayContainsRule;