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
    return "patch-" + repositoryId + "-" + id;
};

DocumentDbPatchProvider.prototype.getPatch = function(repositoryId, id) {
    return this.getPatchDocument(repositoryId, id)
        .then(function(patchDocument){
            return new Patch(patchDocument.data);
        });
};

DocumentDbPatchProvider.prototype.getPatchDocument = function(repositoryId, id) {
    var patchDocumentId = this.getPatchDocumentId(repositoryId, id);
    return this.client.getDocument(patchDocumentId);
};

DocumentDbPatchProvider.prototype.putPatch = function(repositoryId, patch) {
    var patchDocumentId = this.getPatchDocumentId(repositoryId, patch.id);
    var that = this;

    return that.getPatchDocument(repositoryId, patch.id)
        .then(function(patchDocument){
            return that.client.getDocumentClient()
                .then(function(documentClient){
                    if (patchDocument) {
                        patchDocument.data = patch;

                        return documentClient.replaceDocumentAsync(patchDocument._self, patchDocument);
                    }

                    patchDocument = {
                        data: patch,
                        id: patchDocumentId,
                        type: "Patch"
                    };

                    return documentClient.createDocumentAsync(that.client.collection._self, patchDocument);
                });
        })
        .then(function(createOrReplaceResult){
            return new Patch(createOrReplaceResult.resource.data);
        });
};

module.exports = DocumentDbPatchProvider;