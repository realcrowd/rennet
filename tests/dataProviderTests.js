var assert = require('assert');
var uuid = require('node-uuid');
var config = require('config');
var Q = require('q');

describe('Data Providers', function () {
    var providersToTest = [
        {
            constructor: require('../providers/InProcessDataProvider'),
            configuration: null
        },
        {
            constructor: require('../providers/DocumentDbDataProvider'),
            configuration: config.get('DocumentDb')
        }
    ];

    it('can CRU', function(done){
        var currentPromise = Q();
        var expectedObjs = [];

        providersToTest.map(function(providerDefinition) {
            var Provider = providerDefinition.constructor;
            var provider = new Provider();
            if (providerDefinition.configuration) {
                provider.applyConfiguration(providerDefinition.configuration);
            }

            currentPromise = currentPromise.then(function(){
                var obj = {
                    id: uuid.v1(),
                    branches: {
                        blah: [uuid.v1()]
                    }};
                expectedObjs.push(obj);
                return provider.putDocument(obj.id, obj);
            }).then(function(obj){
                return provider.getDocument(obj.id);
            }).then(function(obj){
                var objToValidate = expectedObjs.shift();
                assert.equal(obj.id, objToValidate.id);
                assert.equal(obj.branches.blah[0], objToValidate.branches.blah[0]);

                objToValidate.branches.blah.push(uuid.v1());

                return provider
                    .putDocument(objToValidate.id, objToValidate)
                    .then(function(updatedObj){
                        return provider.getDocument(updatedObj.id);
                    })
                    .then(function(readObj){
                        assert.equal(readObj.branches.blah[0], objToValidate.branches.blah[0]);
                        assert.equal(readObj.branches.blah[1], objToValidate.branches.blah[1]);
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