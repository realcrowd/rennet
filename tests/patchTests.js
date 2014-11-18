var assert = require('assert');
var Patch = require('../models/Patch');
var rules = require('../models/rules');

describe('Patch', function () {
    it('constructs itself as expected', function () {
        var patch = new Patch();
        assert.equal(patch.id, null, "id is supposed to be null");
        assert.equal(patch.rule, null, "rule is supposed to be null");
        assert.equal(patch.applyAtJsonPath, '$.data', "default applyAtJsonPath is unexpected");
        assert.ok(patch.data != null && typeof patch.data === 'object', "data should be an object");
    });
    
    it('applies a patch', function (done) {
        var level1 = new Patch();
        level1.data = {
            'features': {
                'a': false
            }
        };
        level1.rule = new rules.AlwaysOnRule();

        var context = {
            'data': {
                'features': {
                    'a': true,
                    'b': false
                }
            }
        };
        
        level1
            .apply(context)
            .then(function (patchedContext) {
                var expectedData = {
                    'features': {
                        'a': false,
                        'b': false
                    }
                };
                assert.deepEqual(context.data, expectedData, 'Unexpected patch/merge result');
                done();
            })
            .catch(done);
    });

    it('shouldApply works', function (done) {
        var level1 = new Patch();
        level1.rule = new rules.AlwaysOnRule();

        level1
            .shouldApply({})
            .then(function (shouldApply) {
                assert.ok(shouldApply, 'Should apply should have been true');
                done();
            })
            .catch(done);
    });

    it('shouldApply works negative', function (done) {
        var level1 = new Patch();
        level1.rule = new rules.AlwaysOffRule();

        level1
            .shouldApply({})
            .then(function (shouldApply) {
                assert.ok(!shouldApply, 'Should apply should have been false');
                done();
            })
            .catch(done);
    });
});