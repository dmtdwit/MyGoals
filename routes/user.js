var express = require('express');
var router = express.Router();
var models  = require('../models');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.redirect('dashboard');
});

router.get('/profile', function(req, res, next) {
    res.render('user/profile',
        {
            title: 'User Profile'
        }
    );
});

router.get('/list', function(req, res, next) {

    models.User.findAll({
    }).then(function(users) {
        res.render('user/list', {
            title: 'All Users',
            users: users
        });
    });
});

router.get('/dashboard', function(req, res, next) {


});

module.exports = router;
