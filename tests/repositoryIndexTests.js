var assert = require('assert');
var RepositoryIndex = require('../models/RepositoryIndex');
var uuid = require('node-uuid');
var Q = require('q');

describe('Repository Index Providers', function () {

    var providersToTest = [
        require('../providers/InProcessRepositoryIndexProvider'),
        require('../providers/documentdb/DocumentDbRepositoryIndexProvider')
    ];

    it('can CRU', function (done) {
        var currentPromise = Q();
        var expectedObjs = [];

        providersToTest.map(function(constructor) {
            var provider = new constructor();
            currentPromise = currentPromise.then(function(){
                var obj = new RepositoryIndex({
                    id: uuid.v1(),
                    branches: {
                        blah: [uuid.v1()]
                    }});
                expectedObjs.push(obj);
                return provider.putRepositoryIndex(obj);
            }).then(function(obj){
                return provider.getRepositoryIndex(obj.id);
            }).then(function(obj){
                var objToValidate = expectedObjs.shift();
                assert.equal(obj.id, objToValidate.id);
                assert.equal(obj.branches.blah[0], objToValidate.branches.blah[0]);

                objToValidate.branches.blah.push(uuid.v1());

                return provider
                    .putRepositoryIndex(objToValidate)
                    .then(function(updatedObj){
                        return provider.getRepositoryIndex(updatedObj.id);
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