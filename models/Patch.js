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
};

Patch.prototype.shouldApply = function (context) {
    if (!this.rule) {
        throw new Error("A rule must be specified. Unable to evaluate.");
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