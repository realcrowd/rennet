var Q = require('q');
var DocumentClientWrapper = require('documentdb').DocumentClientWrapper;
var extend = require('extend');

var DocumentDbCollectionClient = function(collectionConfig) {
    this.config = collectionConfig;
    this.client = new DocumentClientWrapper(
        this.config.urlConnection,
        this.config.auth,
        this.config.connectionPolicy,
        this.config.consistencyLevel);

    this.database = null;
    this.collection = null;
};

DocumentDbCollectionClient.prototype.getDocumentClient = function() {
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

DocumentDbCollectionClient.prototype.getDocument = function(id) {
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

DocumentDbCollectionClient.prototype.putDocument = function(id, data) {
    var that = this;

    return that.getDocument(id)
        .then(function(document){
            if (document) {
                extend(true, document, data);

                return that.client.replaceDocumentAsync(document._self, document);
            }

            document = {
                id: id
            };

            extend(true, document, data);

            return that.client.createDocumentAsync(that.collection._self, document);
        })
        .then(function(createOrReplaceResult){
            return createOrReplaceResult.resource;
        });
};

DocumentDbCollectionClient.prototype.escapeParam = function(paramValue) {
    return paramValue.replace('"', '\\"');
};

DocumentDbCollectionClient.prototype.getOrCreateRootEntity = function(definition, queryFunc, queryThisArg, createFunc, createThisArg) {
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

DocumentDbCollectionClient.prototype.getOrCreateCollection = function(client, database, collectionDefinition) {
    return this.getOrCreateRootEntity(
        collectionDefinition,
        function(query){return client.queryCollections(database._self, query);},
        this,
        function(definition) { return client.createCollectionAsync(database._self, definition); },
        this);
};

DocumentDbCollectionClient.prototype.getOrCreateDatabase = function(client, databaseDefinition) {
    return this.getOrCreateRootEntity(
        databaseDefinition,
        client.queryDatabases,
        client,
        client.createDatabaseAsync,
        client);
};

module.exports = DocumentDbCollectionClient;