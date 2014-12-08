var Q = require('q');
var extend = require('extend');
var RepositoryIndexProvider = require('./RepositoryIndexProvider');
var RepositoryIndex = require('../models/RepositoryIndex');

var InProcessRepositoryIndexProvider = function(){
    this.repositoryIndexes = {};
};

InProcessRepositoryIndexProvider.prototype = new RepositoryIndexProvider();

InProcessRepositoryIndexProvider.prototype.getRepositoryIndex = function(repositoryId) {
    var repositoryIndexes = this.repositoryIndexes;

    if (!repositoryIndexes.hasOwnProperty(repositoryId)) {
        return Q(null);
    }

    var repositoryIndex = repositoryIndexes[repositoryId];

    return Q(new RepositoryIndex(repositoryIndex));
};

InProcessRepositoryIndexProvider.prototype.putRepositoryIndex = function(repositoryIndex) {
    var repositoryIndexes = this.repositoryIndexes;

    if (!repositoryIndex.id) {
        throw new Error('RepositoryIndex must have an id property.');
    }

    var clone = extend(true, {}, repositoryIndex);
    repositoryIndexes[repositoryIndex.id] = clone;

    return Q(new RepositoryIndex(clone));
};

module.exports = InProcessRepositoryIndexProvider;