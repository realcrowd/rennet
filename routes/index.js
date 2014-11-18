var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    if (req.user)
        res.render('index', { title: 'Rennet' });
    else
        res.redirect('/login');
});

router.get('/login', function (req, res) {
    res.render('login', { title: 'Login to Rennet' });
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/login');
});

module.exports = router;