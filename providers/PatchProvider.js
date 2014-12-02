var PatchProvider = function() {
};

PatchProvider.prototype.getPatch = function(repositoryId, id) {
    throw new Error("Not implemented");
};

PatchProvider.prototype.getPatches = function(repositoryId, patchIds) {
    throw new Error("Not implemented");
};

PatchProvider.prototype.putPatch = function(repositoryId, patch) {
    throw new Error("Not implemented");
};

module.exports = PatchProvider;