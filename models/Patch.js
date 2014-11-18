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
        var matchingNodes = jsonPathEngine.eval(context, applyAtJsonPath);
        if (matchingNodes.length == 0) {
            throw new Error('Nothing found in context at "' + applyAtJsonPath + '". Unable to apply patch.')
        }

        //go patch all the paths it found
        var len = matchingNodes.length;
        for (var i = 0; i < len; i++) {
            extend(true, matchingNodes[i], data);
        }

        return context;
    });
};

module.exports = Patch;