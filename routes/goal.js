var express = require('express');
var router = express.Router();
var models = require('../models');
var sh = require('../service/sessionHandler')

router.get('/create', function(req, res, next) {

    res.render('goal/create', {
        title: 'Create New Goal',
        sess: sh.getSession(req)
    });

});

router.get('/edit', function(req, res, next) {

});

router.post('/save', function(req, res, next) {

    var goalType;

    if(!req.body.goalType) {
        goalType = "PERSONAL"
    } else {
        goalType = "ORGANIZATIONAL"
    }

    if (!req.body.goal) {
        models.User.findOne({
            where: {
                email: req.body.email
            }
        }).then(function (user) {
            models.Goal.create({
                goal: req.body.goal,
                goalType: goalType,
                goalStatus: "PENDING",
                setDate: new Date(),
                deadline: req.body.deadline,
                progress: 0.0
            }).then(function (result) {
                return result.setUser(user.id);
            });
        });
        res.redirect('/user/dashboard/?m=101')
    } else {
        res.redirect('/goal/create/?e=000');
    }
});

router.get('/edit', function(req, res, next) {
    res.render('goal/edit',
        {
            title: 'Edit Goal'
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

    models.Goal.findAll({
    }).then(function(goals) {
        res.render('goal/list', {
            title: 'All Goals',
            goals: goals
        });
    });
});

module.exports = router;
