//Doing a lil cheesy IoC here based on configuration
var config = require('config');

module.exports = {
    PatchProvider: require('./' + config.get('Providers.patchProvider')),
    RepositoryIndexProvider: require('./' + config.get('Providers.repositoryIndexProvider'))
};