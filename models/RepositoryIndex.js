var RepositoryIndex = function (obj) {
    this.id = null;
    this.branches = {};

    for (var prop in obj) {
        this[prop] = obj[prop];
    }
};

module.exports = RepositoryIndex;