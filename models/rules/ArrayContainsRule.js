var Rule = require('../Rule');
var jsonPathEngine = require('JSONPath');
var Q = require('q');

var ArrayContainsRule = function (obj) {
    this.name = "ArrayContainsRule";
    this.arguments = {};

    for (var prop in obj) {
        this[prop] = obj[prop];
    }
};
ArrayContainsRule.prototype = new Rule();

ArrayContainsRule.prototype.arguments = {
    jsonPath: '',   //Where on the context this array lives
    matches: ''     //Regex match for the item in the array
};

ArrayContainsRule.prototype.evaluate = function (context) {
    var arrayToEvaluate = jsonPathEngine.eval(context, this.arguments.jsonPath);

    if (!Array.isArray(arrayToEvaluate)) {
        return Q(false);
    }

    var rx = new RegExp(this.arguments.matches);
    var len = arrayToEvaluate.length;
    for (var i = 0; i < len; i++) {
        if (String(arrayToEvaluate[i]).match(rx) !== null) {
            return Q(true);
        }
    }

    return Q(false);
};

module.exports = ArrayContainsRule;