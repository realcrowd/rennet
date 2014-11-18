var assert = require('assert');
var Patch = require('../models/Patch');
var rules = require('../models/rules');

describe('Patch Tests', function () {
    it('constructs itself as expected', function () {
        var patch = new Patch();
        assert.equal(patch.id, null, "id is supposed to be null");
        assert.equal(patch.rule, null, "rule is supposed to be null");
        assert.equal(patch.applyAtJsonPath, '$.data', "default applyAtJsonPath is unexpected");
        assert.ok(patch.data != null && typeof patch.data === 'object', "data should be an object");
    });
    
    it('should not apply a patch', function (done) {
        var level1 = new Patch();
        level1.data = { };
        level1.rule = new StringMatchesRule();
        level1.rule.arguments.jsonPath = '$.environment';
        level1.rule.arguments.matches = 'live';
        
        var context = {
            'environment': 'dev'
        };
        
        level1
            .shouldApply(context)
            .then(function (shouldApply) {
                assert.equal(shouldApply, false, 'shouldApply should have returned false.');
                done();
            })
            .catch(function(error) {
                done(error);
            });
    });

    it('applies a patch', function (done) {
        var level1 = new Patch();
        level1.data = {
            'features': {
                'a': false,
            }
        };
        level1.rule = new StringMatchesRule();
        level1.rule.arguments.jsonPath = '$.environment';
        level1.rule.arguments.matches = 'live';
        
        var context = {
            'environment': 'live',
            'data': {
                'features': {
                    'a': true,
                    'b': false
                }
            }
        };
        
        level1
            .shouldApply(context)
            .then(function (shouldApply) {
                assert.ok(shouldApply, 'Should apply should have been true');
                return level1.apply(context);
            })
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
            .catch(function (error) {
                done(error);
            });;
    });
});