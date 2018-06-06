var express = require('express');
var router = express.Router();
var models  = require('../models');

router.get('/create', function(req, res, next) {
    res.render('admin/create',
        {
            title: 'Create New User'
        }
    );
});

router.get('/edit', function(req, res, next) {
    res.render('admin/edit',
        {
            title: 'Edit User'
        }
    );
});

router.get('/show', function(req, res, next) {
    res.render('user/profile',
        {
            title: 'User'
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

module.exports = router;
