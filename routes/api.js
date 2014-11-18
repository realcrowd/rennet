var express = require('express');
var router = express.Router();

/*
 * POST the context, returning the data set for the namespace/patch
 */ 
router.post('/data/:namespaceId/:basePatchId', function (req, res) {
    //look for cached namespace/base config

    //read baseline settings for application

    //read settings for environment

    //merge environment into baseline

    //cache application/environment config


    //read patches for environment
    //load rules for selected patches
    //apply patches if rules match

    //return data resulting from applied rules
});

module.exports = router;