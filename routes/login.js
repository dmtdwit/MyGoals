var express = require('express');
var router = express.Router();
var models = require('../models');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('auth/login',
        {
            title: 'Login'
        }
    );
});

module.exports = router;
