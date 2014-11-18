var Q = require('q');
var extend = require('extend');
var jsonPathEngine = require('JSONPath');

var Patch = function () {
    this.id = null;
    this.data = {};
    this.applyAtJsonPath = "$.data"; //apply at the "data" node of the context by default
    this.rule = null;
};

Patch.prototype.shouldApply = function (context) {
    if (!this.rule) {
        throw new Error("A rule must be specified. Unable to evaluate.");
    }
    
    return this.rule.evaluate(context);
};

Patch.prototype.apply = function (context) {
    var data = this.data;
    var applyAtJsonPath = this.applyAtJsonPath;

    return Q.fcall(function() {
        var applyToObject = jsonPathEngine.eval(context, applyAtJsonPath);
        extend(true, applyToObject, data);
        return context;
    });
};

module.exports = Patch;