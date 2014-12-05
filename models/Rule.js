var Rule = function () {
    this.name = null;
    this.arguments = {};
};

Rule.prototype.evaluate = function (context) {
    throw new Error("Base Rule cannot be evaluated. Use one of the subclasses in the 'rules' namespace instead.");
};

module.exports = Rule;