var assert = require('assert');
var Patch = require('../models/Patch');
var uuid = require('node-uuid');
var rules = require('../models/rules');
var Q = require('q');

describe('Patch Providers', function () {

    var patchProvidersToTest = [
        require('../providers/InProcessPatchProvider'),
        require('../providers/documentdb/DocumentDbPatchProvider')
    ];

    it('can CRU', function (done) {
        var currentPromise = Q();
        var repositoryId = "testrun-" + uuid.v1();
        var expectedPatches = [];

        patchProvidersToTest.map(function(patchProviderConstructor) {
            var patchProvider = new patchProviderConstructor();
            currentPromise = currentPromise.then(function(){
                var patch = new Patch({
                    id: uuid.v1(),
                    data: {
                        blah: uuid.v1()
                    },
                    rule: new rules.AlwaysOnRule({arguments:{test:uuid.v1()}})
                });
                expectedPatches.push(patch);
                return patchProvider.putPatch(repositoryId, patch);
            }).then(function(patch){
                return patchProvider.getPatch(repositoryId, patch.id);
            }).then(function(patch){
                var patchToValidate = expectedPatches.shift();
                assert.equal(patch.id, patchToValidate.id);
                assert.equal(patch.data.blah, patchToValidate.data.blah);
                assert.equal(patch.rule.arguments.test, patchToValidate.rule.arguments.test);
                assert.equal(patch.rule.name, patchToValidate.rule.name);
                assert.ok(patch.rule instanceof rules.AlwaysOnRule);

                patchToValidate.data.blah = uuid.v1();
                return patchProvider
                    .putPatch(repositoryId, patchToValidate)
                    .then(function(updatedPatch){
                        return patchProvider.getPatch(repositoryId, updatedPatch.id);
                    })
                    .then(function(readPatch){
                        assert.equal(readPatch.data.blah, patchToValidate.data.blah);
                    });
            });
        });

        currentPromise
            .then(function(){
                done();
            })
            .catch(done);
    });


});