var Q = require('q');
var extend = require('extend');
var PatchProvider = require('../PatchProvider');
var DocumentDbCollectionClient = require('./DocumentDbCollectionClient');
var config = require('config');
var Patch = require('../../models/Patch');

var DocumentDbPatchProvider = function(configuration){
    this.configuration = config.has("DocumentDbPatchProvider") ? config.get("DocumentDbPatchProvider") : {};
    if (configuration) {
        extend(true, this.configuration, configuration);
    }
    this.client = new DocumentDbCollectionClient(this.configuration.documentDbConnection);
};

DocumentDbPatchProvider.prototype = new PatchProvider();

DocumentDbPatchProvider.prototype.getPatchDocumentId = function(repositoryId, id) {
    return "Patch-" + repositoryId + "-" + id;
};

DocumentDbPatchProvider.prototype.getPatch = function(repositoryId, id) {
    var documentId = this.getPatchDocumentId(repositoryId, id);
    return this.client
        .getDocument(documentId)
        .then(function(document){
            return new Patch(document.data);
        });
};

DocumentDbPatchProvider.prototype.putPatch = function(repositoryId, patch) {
    var documentId = this.getPatchDocumentId(repositoryId, patch.id);
    return this.client
        .putDocument(documentId, { data: patch, type: "Patch" })
        .then(function(document){
            return new Patch(document.data);
        });
};

module.exports = DocumentDbPatchProvider;