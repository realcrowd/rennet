var express = require('express');
var router = express.Router();
var RennetService = require('../services/RennetService');

/*
 * POST the context, returning the data set for the repository/branch
 */ 
router.post('/context/:repositoryId/:branchId', function (req, res, next) {
    var rennetService = new RennetService();

    rennetService
        .resolveContext(req.params.repositoryId, req.params.branchId, req.body)
        .then(function(context){
            res.send(context);
            next();
        })
        .catch(next);
});

module.exports = router;