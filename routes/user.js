var express = require('express');
var router = express.Router();
var models = require('../models');
// var md5 = require('md5');
var sh = require('../service/sessionHandler');

router.get('/create', function(req, res, next) {
    models.User.findAll({
    }).then(function(users) {
        res.render('user/create', {
            title: 'Create New User',
            users: users,
            sess: sh.getSession(req)
        });
    });
});

router.get('/edit', function(req, res, next) {
    var id = req.query['id'];

    models.User.findAll({
    }).then(function(users) {
        models.User.findOne({where:{id: id}}).then(function (user) {
            res.render('user/edit', {
                title: 'Edit User | My Goals',
                firstName: user.name.split(" ")[0],
                lastName: user.name.split(" ")[1],
                user: user,
                users: users
            });
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
        password: req.body.email,
        email: req.body.email,
        category: category
    }).then(function(result){
        return result.setRole(role);
    }).then(function(resultTwo){
        return resultTwo.setManager(req.body.manager);
    });

    res.redirect("/admin/dashboard");
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
            title: 'User Profile',
            sess: sh.getSession(req)
        }
    );
});

router.get('/list', function(req, res, next) {

    models.User.findAll({
    }).then(function(users) {
        res.render('user/list', {
            title: 'All Users',
            users: users,
            sess: sh.getSession(req)
        });
    });
});

router.get('/dashboard', function(req, res, next) {
    var sess = req.session;
    res.render('user/dashboard',
        {
            title: 'Dashboard',
            sess: sess
        }
    );

});

module.exports = router;
