var express = require('express');
var router = express.Router();
var RennetService = require('../services/RennetService');
var rennetService = new RennetService();

var putRepository = function(req, res, next) {
    //TODO: handle etags

    rennetService.repositoryIndexService
        .putRepositoryIndex(req.body)
        .then(function(repositoryIndex){
            res.send(repositoryIndex);
        })
        .catch(next);
};

/*
 * POST/PUT to create or update a repository
 */
router.post('/repository/:repositoryId', putRepository);
router.put('/repository/:repositoryId', putRepository);

router.get('/repository/:repositoryId', function (req, res, next) {
    rennetService.repositoryIndexService
        .getRepositoryIndex(req.params.repositoryId)
        .then(function(repositoryIndex){
            res.send(repositoryIndex);
        })
        .catch(next);
});

var putPatch = function(req, res, next) {
    //TODO: handle etags

    rennetService.patchService
        .putPatch(req.params.repositoryId, req.body)
        .then(function(patch){
            res.send(patch);
        })
        .catch(next);
};


/*
 * POST/PUT to create or update a patch
 */
router.post('/repository/:repositoryId/patch/:patchId', putPatch);
router.put('/repository/:repositoryId/patch/:patchId', putPatch);

router.get('/repository/:repositoryId/patch/:patchId', function (req, res, next) {
    rennetService.patchService
        .getPatch(req.params.repositoryId, req.params.patchId)
        .then(function(patch){
            res.send(patch);
        })
        .catch(next);
});

/*
 * POST the context, returning the data set for the repository/branch
 */ 
router.post('/repository/:repositoryId/branch/:branchId/context', function (req, res, next) {

    rennetService
        .resolveContext(req.params.repositoryId, req.params.branchId, req.body)
        .then(function(context){
            res.send(context);
        })
        .catch(next);
});

module.exports = router;