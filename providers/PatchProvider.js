var Q = require('q');

var PatchProvider = function() {
};

PatchProvider.prototype.getPatch = function(repositoryId, id) {
    throw new Error("Not implemented");
};

PatchProvider.prototype.getPatches = function(repositoryId, patchIds) {
    var patchProvider = this;

    //load all the patches in parallel
    return Q.fcall(function(){
        return patchIds.map(function(patchId){
            return patchProvider.getPatch(repositoryId, patchId);
        });
    }).all();
};

PatchProvider.prototype.putPatch = function(repositoryId, patch) {
    throw new Error("Not implemented");
};

module.exports = PatchProvider;