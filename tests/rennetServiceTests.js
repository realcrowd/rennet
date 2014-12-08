var assert = require('assert');
var Patch = require('../models/Patch');
var RepositoryIndex = require('../models/RepositoryIndex');
var rules = require('../models/rules');
var RennetService = require('../services/RennetService');

describe('Rennet Service', function () {
    it('can resolve a branch with one and only one patch', function (done) {
        var service = new RennetService();
        var repositoryId = 'test';

        //test data
        service.patchService.putPatch(repositoryId, new Patch({
            id: 'constants',
            data: {
                constants: {
                    'one': 1,
                    'two': 'two',
                    'three': null
                }
            },
            rule: new rules.AlwaysOnRule()
        }));

        service.repositoryIndexService.putRepositoryIndex(new RepositoryIndex({
            id: repositoryId,
            branches: {
                baseline: {
                    patches : ['constants']
                }
            }
        }));

        //resolution!
        service
            .resolveContext(repositoryId, 'baseline', {data:{}})
            .then(function(context){
                assert.ok(context, 'context not truthy');
                assert.equal(context.data.constants.three, null, 'three value not correct');
                assert.equal(context.data.constants.two, 'two', 'two value not correct');
                assert.equal(context.data.constants.one, 1, 'one value not correct');
                done();
            })
            .catch(done);

    });

    it('can resolve a simple patch', function (done) {
        var service = new RennetService();
        var repositoryId = 'test';

        //test data
        service.patchService.putPatch(repositoryId, new Patch({
            id: 'constants',
            data: {
                constants: {
                    'one': 1,
                    'two': 'two',
                    'three': null
                }
            },
            rule: new rules.AlwaysOnRule()
        }));

        service.patchService.putPatch(repositoryId, new Patch({
            id: 'two_is_three',
            data: {
                constants: {
                    'two': 'three'
                }
            },
            rule: new rules.AlwaysOnRule()
        }));

        service.repositoryIndexService.putRepositoryIndex(new RepositoryIndex({
            id: repositoryId,
            branches: {
                baseline: {
                    patches : ['constants']
                },
                patched: {
                    patches: ['branch:baseline','two_is_three']
                }
            }
        }));

        //resolution!
        service
            .resolveContext(repositoryId, 'patched', {data:{}})
            .then(function(context){
                assert.ok(context, 'context not truthy');
                assert.equal(context.data.constants.three, null, 'three value not correct');
                assert.equal(context.data.constants.two, 'three', 'two value not correct');
                assert.equal(context.data.constants.one, 1, 'one value not correct');
                done();
            })
            .catch(done);

    });

    it('likes nesting', function (done) {
        var service = new RennetService();
        var repositoryId = 'test';

        //test data
        service.patchService.putPatch(repositoryId, new Patch({
            id: 'constants',
            data: {
                constants: {
                    'one': 1,
                    'two': 'two',
                    'three': null
                }
            },
            rule: new rules.AlwaysOnRule()
        }));

        service.patchService.putPatch(repositoryId, new Patch({
            id: 'two_is_three',
            data: {
                constants: {
                    'two': 'three'
                }
            },
            rule: new rules.AlwaysOnRule()
        }));

        service.patchService.putPatch(repositoryId, new Patch({
            id: 'three_is_three',
            data: {
                constants: {
                    'three': 'three'
                }
            },
            rule: new rules.AlwaysOnRule()
        }));

        service.patchService.putPatch(repositoryId, new Patch({
            id: 'add_four',
            data: {
                constants: {
                    'four': 'four'
                }
            },
            rule: new rules.AlwaysOnRule()
        }));

        service.patchService.putPatch(repositoryId, new Patch({
            id: 'add_features_table',
            data: {
                features: {
                    'do_it': true,
                    'dont_do_it': false
                }
            },
            rule: new rules.AlwaysOnRule()
        }));

        service.repositoryIndexService.putRepositoryIndex(new RepositoryIndex({
            id: repositoryId,
            branches: {
                baseline: {
                    patches : ['constants']
                },
                patched: {
                    patches: ['branch:baseline','two_is_three']
                },
                superPatched: {
                    patches: ['branch:patched','three_is_three']
                },
                superDuperPatched: {
                    patches: ['branch:superPatched','add_four', 'add_features_table']
                }
            }
        }));

        //resolution!
        service
            .resolveContext(repositoryId, 'superDuperPatched', {data:{}})
            .then(function(context){
                assert.ok(context, 'context not truthy');
                assert.equal(context.data.constants.four, 'four', 'four value not correct');
                assert.equal(context.data.constants.three, 'three', 'three value not correct');
                assert.equal(context.data.constants.two, 'three', 'two value not correct');
                assert.equal(context.data.constants.one, 1, 'one value not correct');
                assert.ok(context.data.features, 'features table not truthy');
                assert.equal(context.data.features.do_it, true, 'features.do_it not true');
                assert.equal(context.data.features.dont_do_it, false, 'features.dont_do_it not false');
                done();
            })
            .catch(done);
    });

    it('errors on overflow', function (done) {
        var service = new RennetService();
        var repositoryId = 'test';

        //test data
        service.patchService.putPatch(repositoryId, new Patch({
            id: 'constants',
            data: {
                constants: {
                    'one': 1,
                    'two': 'two',
                    'three': null
                }
            },
            rule: new rules.AlwaysOnRule()
        }));

        service.repositoryIndexService.putRepositoryIndex(new RepositoryIndex({
            id: repositoryId,
            branches: {
                baseline: {
                    patches : ['constants', 'branch:patched']
                },
                patched: {
                    patches: ['branch:baseline']
                }
            }
        }));

        //resolution!
        service
            .resolveContext(repositoryId, 'superDuperPatched', {data:{}})
            .then(function(context){
                done(new Error("Should have received a catch callback"));
            })
            .catch(function(error){
                done();
            });
    });

    it('applies patches in order', function (done) {
        var service = new RennetService();
        var repositoryId = 'test';

        //test data
        service.patchService.putPatch(repositoryId, new Patch({
            id: 'constants',
            data: {
                constants: {
                    'one': 1,
                    'two': 'two',
                    'three': null
                }
            },
            rule: new rules.AlwaysOnRule()
        }));

        service.patchService.putPatch(repositoryId, new Patch({
            id: 'two_is_three',
            data: {
                constants: {
                    'two': 'three'
                }
            },
            rule: new rules.AlwaysOnRule()
        }));

        service.patchService.putPatch(repositoryId, new Patch({
            id: 'two_is_2',
            data: {
                constants: {
                    'two': 2
                }
            },
            rule: new rules.AlwaysOnRule()
        }));

        service.patchService.putPatch(repositoryId, new Patch({
            id: 'two_is_four',
            data: {
                constants: {
                    'two': 'four'
                }
            },
            rule: new rules.AlwaysOnRule()
        }));

        service.repositoryIndexService.putRepositoryIndex(new RepositoryIndex({
            id: repositoryId,
            branches: {
                baseline: {
                    patches : ['constants','two_is_three','two_is_four','two_is_2']
                }
            }
        }));

        //resolution!
        service
            .resolveContext(repositoryId, 'baseline', {data:{}})
            .then(function(context){
                assert.equal(context.data.constants.two, 2, 'two value not correct');
                done();
            })
            .catch(done);
    });
});