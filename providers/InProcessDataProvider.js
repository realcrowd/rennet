var DataProvider = require('./DataProvider');
var Q = require('q');

var InProcessDataProvider = function(config) {
    this.config = config;
    this.data = {};
};

InProcessDataProvider.prototype = new DataProvider();

InProcessDataProvider.prototype.getDocument = function(id) {
    if (!this.data.hasOwnProperty(id)) {
        return Q(null);
    }

    var docAsJson = this.data[id];
    var document = JSON.parse(docAsJson);

    return Q(document);
};

InProcessDataProvider.prototype.putDocument = function(id, document) {
    var docAsJson = JSON.stringify(document);
    this.data[id] = docAsJson;

    var cloneForReturn = JSON.parse(docAsJson);
    return Q(cloneForReturn);
};

InProcessDataProvider.prototype.applyConfiguration = function(config) {
    this.config = config;
};


module.exports = InProcessDataProvider;