var Rule = function (obj) {
    this.arguments = {};

    for (var prop in obj) {
        this[prop] = obj[prop];
    }
};

Rule.prototype.evaluate = function (context) {
    throw new Error("Base Rule cannot be evaluated. Use one of the subclasses in the 'rules' namespace instead.");
};

module.exports = Rule;