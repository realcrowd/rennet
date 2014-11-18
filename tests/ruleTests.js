var assert = require('assert');
var rules = require('../models/rules');

describe('AlwaysOnRule', function () {
    it('works correctly', function (done) {
        var rule = new rules.AlwaysOnRule();
        rule.evaluate({})
            .then(function(on){
                assert.ok(on, 'AlwaysOnRule was not on');
                done();
            })
            .catch(done);
    });
    it('works even with null data', function (done) {
        var rule = new rules.AlwaysOnRule();
        rule.evaluate(null)
            .then(function(on){
                assert.ok(on, 'AlwaysOnRule was not on');
                done();
            })
            .catch(done);
    });
});

describe('AlwaysOffRule', function () {
    it('works correctly', function (done) {
        var rule = new rules.AlwaysOffRule();
        rule.evaluate({})
            .then(function(on){
                assert.ok(!on, 'AlwaysOffRule was not off');
                done();
            })
            .catch(done);
    });
    it('works even with null data', function (done) {
        var rule = new rules.AlwaysOffRule();
        rule.evaluate(null)
            .then(function(on){
                assert.ok(!on, 'AlwaysOffRule was not off');
                done();
            })
            .catch(done);
    });
});

describe('StringMatchesRule', function () {
    it('works correctly', function (done) {
        var rule = new rules.StringMatchesRule();
        rule.arguments.jsonPath = '$.environment';
        rule.arguments.matches = 'live';

        rule.evaluate({'environment':'live'})
            .then(function(on){
                assert.ok(on, 'StringMatchesRule was not on');
                done();
            })
            .catch(done);
    });

    it('works in the negative', function (done) {
        var rule = new rules.StringMatchesRule();
        rule.arguments.jsonPath = '$.environment';
        rule.arguments.matches = 'live';

        rule.evaluate({'environment':'dev'})
            .then(function(on){
                assert.ok(!on, 'StringMatchesRule was on');
                done();
            })
            .catch(done);
    });

    it('works with multiple results', function (done) {
        var rule = new rules.StringMatchesRule();
        rule.arguments.jsonPath = '$..environment';
        rule.arguments.matches = 'live';

        rule.evaluate({
                'environment':'live',
                'nested': {
                    'environment':'live'
                }
            })
            .then(function(on){
                assert.ok(on, 'StringMatchesRule was not on');
                done();
            })
            .catch(done);
    });

    it('fails with AND on multiple results', function (done) {
        var rule = new rules.StringMatchesRule();
        rule.arguments.jsonPath = '$..environment';
        rule.arguments.matches = 'live';

        rule.evaluate({
                'environment':'live',
                'nested': {
                    'environment':'dev'
                }
            })
            .then(function(on){
                assert.ok(!on, 'StringMatchesRule was on');
                done();
            })
            .catch(done);
    });
});