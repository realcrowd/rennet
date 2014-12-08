var Q = require('q');
var extend = require('extend');
var PatchProvider = require('./PatchProvider');
var Patch = require('../models/Patch');

var InProcessPatchProvider = function(){
    this.patches = {};
};

InProcessPatchProvider.prototype = new PatchProvider();

InProcessPatchProvider.prototype.getPatch = function(repositoryId, id) {
    var patches = this.patches;

    if (!patches.hasOwnProperty(repositoryId)) {
        throw new Error("Repository not found");
    }

    if (!patches[repositoryId].hasOwnProperty(id)) {
        return Q(null);
    }

    var patch = patches[repositoryId][id];

    return Q(new Patch(patch));
};

InProcessPatchProvider.prototype.putPatch = function(repositoryId, patch) {
    var patches = this.patches;

    if (!patches.hasOwnProperty(repositoryId)) {
        patches[repositoryId] = {};
    }
    if (!patch.id) {
        throw new Error('Patch must have an id property, unique within the repositoryId.');
    }

    //TODO: handle ETags like our persistent providers?
    var clone = extend(true, {}, patch);
    patches[repositoryId][patch.id] = clone;

    return Q(new Patch(clone));
};

module.exports = InProcessPatchProvider;