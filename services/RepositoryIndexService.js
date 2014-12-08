var RepositoryIndex = require('../models/RepositoryIndex');
var DataService = require('./DataService');

var RepositoryIndexService = function(configuration){
    configuration = configuration || "RepositoryIndexService";
    this.applyConfiguration(configuration);
};

RepositoryIndexService.prototype = new DataService();


RepositoryIndexService.prototype.getRepositoryIndexDocumentId = function(repositoryId) {
    return "RepositoryIndex-" + repositoryId;
};

RepositoryIndexService.prototype.getRepositoryIndex = function(repositoryId) {
    var documentId = this.getRepositoryIndexDocumentId(repositoryId);
    return this.dataProvider
        .getDocument(documentId)
        .then(function(document){
            return new RepositoryIndex(document.data);
        });
};

RepositoryIndexService.prototype.putRepositoryIndex = function(repositoryIndex) {
    var documentId = this.getRepositoryIndexDocumentId(repositoryIndex.id);
    return this.dataProvider
        .putDocument(documentId, { data: repositoryIndex, type: "RepositoryIndex" })
        .then(function(document){
            return new RepositoryIndex(document.data);
        });
};

module.exports = RepositoryIndexService;
