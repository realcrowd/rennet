var Q = require('q');
var extend = require('extend');
var config = require('config');

var DataService = function() {
};

DataService.prototype.applyConfiguration = function(configuration) {
    if (typeof configuration == "string" || configuration instanceof String) {
        //load config from config section
        this.configuration = config.get(configuration);
    } else {
        //load config from object
        this.configuration = configuration;
    }

    //load our data provider based on our configuration
    var DataProvider = require('../providers/' + this.configuration.dataProvider.module);
    this.dataProvider = new DataProvider();
    var dataProviderConfig = (this.configuration.dataProvider.hasOwnProperty("configKey") && config.has(this.configuration.dataProvider.configKey))
        ? config.get(this.configuration.dataProvider.configKey)
        : {};
    this.dataProvider.applyConfiguration(dataProviderConfig);
};

module.exports = DataService;