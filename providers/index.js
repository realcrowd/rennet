//TODO: choose these with an IoC, or do DI into the consumers

module.exports = {
    PatchProvider: require('./InProcessPatchProvider'),
    RepositoryIndexProvider: require('./InProcessRepositoryIndexProvider')
};