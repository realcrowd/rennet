var Q = require('q');
var DocumentClientWrapper = require('documentdb').DocumentClientWrapper;
var extend = require('extend');
var DataProvider = require('./DataProvider');

var DocumentDbDataProvider = function(config) {
    this.client = null;
    this.database = null;
    this.collection = null;

    if (config) {
        this.applyConfiguration(config);
    }
};

DocumentDbDataProvider.prototype = new DataProvider();

DocumentDbDataProvider.prototype.applyConfiguration = function(config) {
    this.config = config;

    this.client = new DocumentClientWrapper(
        this.config.urlConnection,
        this.config.auth,
        this.config.connectionPolicy,
        this.config.consistencyLevel);
};


DocumentDbDataProvider.prototype.getDocumentClient = function() {
    if (this.database && this.collection && this.client) {
        return Q(this.client);
    }

    var that = this;

    return that.getOrCreateDatabase(that.client, that.config.databaseDefinition)
        .then(function(database) {
            that.database = database;
            return that.getOrCreateCollection(that.client, database, that.config.collectionDefinition)
                .then(function(collection){
                    that.collection = collection;
                    return that.client;
                });
        });
};

DocumentDbDataProvider.prototype.getDocument = function(id) {
    var that = this;
    return this.getDocumentClient()
        .then(function(client) {
            return client
                .queryDocuments(that.collection._self, 'SELECT * FROM root r WHERE r.id="' + that.escapeParam(id) + '"')
                .toArrayAsync()
                .then(function(queryResult){
                    if (queryResult.feed.length === 0) {
                        return null;
                    }

                    return queryResult.feed[0];
                });
        });
};

DocumentDbDataProvider.prototype.putDocument = function(id, document) {
    var that = this;

    return that.getDocument(id)
        .then(function(updatedDocument){
            if (updatedDocument) {
                extend(true, updatedDocument, document);

                return that.client.replaceDocumentAsync(updatedDocument._self, updatedDocument);
            }

            updatedDocument = {
                id: id
            };

            extend(true, updatedDocument, document);

            return that.client.createDocumentAsync(that.collection._self, updatedDocument);
        })
        .then(function(createOrReplaceResult){
            return createOrReplaceResult.resource;
        });
};

DocumentDbDataProvider.prototype.escapeParam = function(paramValue) {
    return paramValue.replace('"', '\\"');
};

DocumentDbDataProvider.prototype.getOrCreateRootEntity = function(definition, queryFunc, queryThisArg, createFunc, createThisArg) {
    return queryFunc.call(queryThisArg, 'SELECT * FROM root r WHERE r.id="' + this.escapeParam(definition.id) + '"')
        .toArrayAsync()
        .then(function(queryResult) {
            if (queryResult.feed.length === 0) {
                return createFunc.call(createThisArg, definition)
                    .then(function(createResult){
                        return createResult.resource;
                    });
            }

            return queryResult.feed[0];
        });
};

DocumentDbDataProvider.prototype.getOrCreateCollection = function(client, database, collectionDefinition) {
    return this.getOrCreateRootEntity(
        collectionDefinition,
        function(query){return client.queryCollections(database._self, query);},
        this,
        function(definition) { return client.createCollectionAsync(database._self, definition); },
        this);
};

DocumentDbDataProvider.prototype.getOrCreateDatabase = function(client, databaseDefinition) {
    return this.getOrCreateRootEntity(
        databaseDefinition,
        client.queryDatabases,
        client,
        client.createDatabaseAsync,
        client);
};

module.exports = DocumentDbDataProvider;