var Q = require('q');
var Patch = require('../models/Patch');
var PatchService = require('./PatchService');
var RepositoryIndexService = require('./RepositoryIndexService');

var RennetService = function(configuration) {
    this.branchPatchIdPrefix = 'branch:';

    if (configuration && configuration.patchService) {
        this.patchService = new PatchService(configuration.patchService);
    } else {
        this.patchService = new PatchService()
    }

    if (configuration && configuration.repositoryIndexService) {
        this.repositoryIndexService = new RepositoryIndexService(configuration.repositoryIndexService);
    } else {
        this.repositoryIndexService = new RepositoryIndexService();
    }
};

RennetService.prototype.expandPatchList = function(repositoryIndex, branch, depth) {
    var results = [];

    depth = (depth || 0) + 1;

    //arbitrary max depth. todo: reference loop checking
    if (depth > 100) {
        throw new Error("Max branch depth of 100 reached. Consider nesting fewer branches. Did you create an infinite reference loop?");
    }

    var numPatchesInBranch = branch.patches.length;
    for (var i = 0; i < numPatchesInBranch; i++)
    {
        var patchId = branch.patches[i];
        if (patchId.indexOf(this.branchPatchIdPrefix) === 0) {
            var subBranchId = patchId.substring(this.branchPatchIdPrefix.length);
            var subBranchPatchIds = this.expandPatchList(repositoryIndex, repositoryIndex.branches[subBranchId], depth);
            var numSubPatches = subBranchPatchIds.length;
            for (var j = 0; j < numSubPatches; j++) {
                results.push(subBranchPatchIds[j]);
            }
        } else {
            results.push(patchId);
        }
    }

    return results;
};

RennetService.prototype.resolveContext = function(repositoryId, branchId, context) {
    if (!repositoryId) {
        throw new Error("A repositoryId is required");
    }
    if (!branchId) {
        throw new Error("A branchId is required");
    }

    var patchService = this.patchService;
    var rennetService = this;

    //get the repository index so we know how to apply patches
    return this.repositoryIndexService.getRepositoryIndex(repositoryId)
        .then(function(repositoryIndex) {
            if (!repositoryIndex) {
                throw new Error("Repository Index not found for " + repositoryId);
            }

            if (!repositoryIndex.branches[branchId]) {
                throw new Error(branchId + " branchId not found in repository index");
            }

            //the expanded, in order, list of patches to apply
            var patchList = rennetService.expandPatchList(repositoryIndex, repositoryIndex.branches[branchId]);

            //this is going to load all the patches into memory a couple times.
            //might want to be smarter about this in the future and add more round trips to the provider.
            return patchService.getPatches(repositoryId, patchList);
        })
        .then(function(patches) {
            //we have the list of patches to apply, in order. do it.
            //chain the promises so they execute serially and not in parallel
            var currentPromise = Q();
            var promises = patches.map(function(patch) {
                return currentPromise = currentPromise.then(function() {
                    return patch.shouldApply(context);
                }).then(function(shouldApply){
                    if (shouldApply) {
                        return patch.apply(context);
                    } else {
                        return context;
                    }
                });
            });

            return Q.all(promises)
                .then(function(results) {
                    return context;
                });
        });
};

module.exports = RennetService;