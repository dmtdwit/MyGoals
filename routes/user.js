var express = require('express');
var router = express.Router();
var models = require('../models');
var md5 = require('md5');

router.get('/create', function(req, res, next) {
    models.User.findAll({
    }).then(function(users) {
        res.render('user/create', {
            title: 'Create New User',
            users: users
        });
    });
});

router.post('/save', function(req, res, next) {

    var category, role;

    if(!req.body.role) {
        role = 2
    } else {
        role = 1
    }

    if(!req.body.category) {
        category = "EMPLOYEE"
    } else {
        category = "STUDENT"
    }

    models.User.create({
        name: req.body.firstName + " " + req.body.lastName,
        password: md5(req.body.email),
        email: req.body.email,
        category: category
    }).then(function(result){
        return result.setRole(role);
    });

    models.User.findOne({
        where: {
            email: req.body.manager
        }
    }).then(function(result){
        models.User.findOne({
            where: {
                email: req.body.email
            }
        }).then(function(resultTwo){

        })
    });

    res.redirect("create");
});

router.get('/edit', function(req, res, next) {
    res.render('user/edit',
        {
            title: 'Edit User'
        }
    );
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

    res.render('user/dashboard',
        {
            title: 'Dashboard'
        }
    );

});

module.exports = router;
