var Q = require('q');
var extend = require('extend');
var jsonPathEngine = require('JSONPath');

var Patch = function (obj) {
    this.id = null;
    this.data = {};
    this.applyAtJsonPath = "$.data"; //apply at the "data" node of the context by default
    this.rule = null;

    for (var prop in obj) {
        this[prop] = obj[prop];
    }

    //Setup expected prototype for the rule
    if (this.rule && this.rule.name) {
        var RuleConstructor = require('./rules')[this.rule.name];
        this.rule = new RuleConstructor(this.rule);
    }
};

Patch.prototype.shouldApply = function (context) {
    //No rule means apply no matter what, for simplicity of the JSON.
    if (!this.rule) {
        return Q(true);
    }
    
    return this.rule.evaluate(context);
};

Patch.prototype.apply = function (context) {
    var matchingNodes = jsonPathEngine.eval(context, this.applyAtJsonPath);
    if (matchingNodes.length == 0) {
        throw new Error('Nothing found in context at "' + this.applyAtJsonPath + '". Unable to apply patch.')
    }

    //go patch all the paths it found
    var len = matchingNodes.length;
    for (var i = 0; i < len; i++) {
        extend(true, matchingNodes[i], this.data);
    }

    return Q(context);
};

module.exports = Patch;