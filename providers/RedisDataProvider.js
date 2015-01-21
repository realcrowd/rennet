var DataProvider = require('./DataProvider');
var Q = require('q');
var redis = require('redis');
var extend = require('extend');

var RedisDataProvider = function(config) {
    this.client = null;

    this.applyConfiguration(config);
};

RedisDataProvider.prototype = new DataProvider();

RedisDataProvider.prototype.getDocument = function(id) {
    //todo: wait for auth if required
    //todo: read from redis
    var docAsJson = this.data[id];
    var document = JSON.parse(docAsJson);

    return Q(document);
};

RedisDataProvider.prototype.putDocument = function(id, document) {
    //todo: wait for auth if required
    //todo: write to redis
    var docAsJson = JSON.stringify(document);


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

    //todo: auth if required
};


module.exports = RedisDataProvider;