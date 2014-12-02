var assert = require('assert');
var Patch = require('../models/Patch');
var RepositoryIndex = require('../models/RepositoryIndex');
var rules = require('../models/rules');
var RennetService = require('../services/RennetService');

describe('Rennet Service', function () {
    it('can resolve a simple patch', function (done) {
        var service = new RennetService();
        var repositoryId = 'test';

        //test data
        service.patchProvider.putPatch(repositoryId, new Patch({
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

        service.patchProvider.putPatch(repositoryId, new Patch({
            id: 'two_is_three',
            data: {
                constants: {
                    'two': 'three'
                }
            },
            rule: new rules.AlwaysOnRule()
        }));

        service.repositoryIndexProvider.putRepositoryIndex(new RepositoryIndex({
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
                done();
            })
            .catch(done);

    });
});