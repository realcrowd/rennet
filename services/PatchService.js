var Q = require('q');
var Patch = require('../models/Patch');
var DataService = require('./DataService');

var PatchService = function(configuration){
    configuration = configuration || "PatchService";
    this.applyConfiguration(configuration);
};

PatchService.prototype = new DataService();

PatchService.prototype.getPatchDocumentId = function(repositoryId, id) {
    return "Patch-" + repositoryId + "-" + id;
};

PatchService.prototype.getPatch = function(repositoryId, id) {
    var documentId = this.getPatchDocumentId(repositoryId, id);
    return this.dataProvider
        .getDocument(documentId)
        .then(function(document){
            return new Patch(document.data);
        });
};

PatchService.prototype.getPatches = function(repositoryId, patchIds) {
    var patchService = this;

    return this.dataProvider
        .getDocuments(patchIds.map(function(patchId) {
            return patchService.getPatchDocumentId(repositoryId, patchId);
        }))
        .then(function(documents) {
            return documents.map(function(document){
                return new Patch(document.data);
            });
        });
};

PatchService.prototype.putPatch = function(repositoryId, patch) {
    var documentId = this.getPatchDocumentId(repositoryId, patch.id);
    return this.dataProvider
        .putDocument(documentId, { data: patch, type: "Patch" })
        .then(function(document){
            return new Patch(document.data);
        });
};

module.exports = PatchService;