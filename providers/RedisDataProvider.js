var DataProvider = require('./DataProvider');
var Q = require('q');
var redis = require('redis');
var extend = require('extend');

var RedisDataProvider = function(config) {
    this.client = null;

    this.applyConfiguration(config);
};

RedisDataProvider.prototype = new DataProvider();

RedisDataProvider.prototype.getDocumentId = function(id) {
    return "rennet:doc:" + id;
};

RedisDataProvider.prototype.getDocument = function(id) {
    return Q.ninvoke(this.client, "get", this.getDocumentId(id))
        .then(function(docAsJson) {
            return JSON.parse(docAsJson);
        });
};

RedisDataProvider.prototype.putDocument = function(id, document) {
    var docAsJson = JSON.stringify(document);
    return Q.ninvoke(this.client, "set", this.getDocumentId(id), docAsJson)
        .then(function() {
            return document;
        });
};

RedisDataProvider.prototype.applyConfiguration = function(config) {
    this.config = config;

    var defaultConfig = {
        host: '127.0.0.1',
        port: 6379,
        options: {}
    };

    this.config = extend(true, defaultConfig, config);

    this.client = redis.createClient(this.config.port, this.config.host, this.config.options);
};


module.exports = RedisDataProvider;