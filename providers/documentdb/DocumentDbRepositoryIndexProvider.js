var RepositoryIndex = require('../../models/RepositoryIndex');
var RepositoryIndexProvider = require('../RepositoryIndexProvider');
var DocumentDbCollectionClient = require('./DocumentDbCollectionClient');
var config = require('config');

var DocumentDbRepositoryIndexProvider = function(configuration){
    this.configuration = config.has("DocumentDbRepositoryIndexProvider") ? config.get("DocumentDbRepositoryIndexProvider") : {};
    if (configuration) {
        extend(true, this.configuration, configuration);
    }
    this.client = new DocumentDbCollectionClient(this.configuration.documentDbConnection);
};

DocumentDbRepositoryIndexProvider.prototype = new RepositoryIndexProvider();


DocumentDbRepositoryIndexProvider.prototype.getRepositoryIndexDocumentId = function(repositoryId) {
    return "RepositoryIndex-" + repositoryId;
};

DocumentDbRepositoryIndexProvider.prototype.getRepositoryIndex = function(repositoryId) {
    var documentId = this.getRepositoryIndexDocumentId(repositoryId);
    return this.client
        .getDocument(documentId)
        .then(function(document){
            return new RepositoryIndex(document.data);
        });
};

DocumentDbRepositoryIndexProvider.prototype.putRepositoryIndex = function(repositoryIndex) {
    var documentId = this.getRepositoryIndexDocumentId(repositoryIndex.id);
    return this.client
        .putDocument(documentId, { data: repositoryIndex, type: "RepositoryIndex" })
        .then(function(document){
            return new RepositoryIndex(document.data);
        });
};

module.exports = DocumentDbRepositoryIndexProvider;
