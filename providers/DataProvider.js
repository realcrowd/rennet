var Q = require('q');

var DataProvider = function() {
};

DataProvider.prototype.getDocument = function(id) {
    throw new Error("Not implemented");
};

DataProvider.prototype.getDocuments = function(ids) {
    //naive parallel implementation is the default.
    //smart providers will do this on their own.
    var dataProvider = this;
    return Q().then(function(){
        return ids.map(dataProvider.getDocument, dataProvider);
    }).all();
};

DataProvider.prototype.putDocument = function(id, document) {
    throw new Error("Not implemented");
};

DataProvider.prototype.applyConfiguration = function(config) {
    throw new Error("Not implemented");
};

module.exports = DataProvider;