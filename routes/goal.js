var express = require('express');
var router = express.Router();
var models = require('../models');
var sh = require('../service/sessionHandler')

router.get('/create', function(req, res, next) {

    sh.checkSession(req, res);
    var sess = sh.getSession(req);

    if (sess.role !== "USER") {
        res.redirect('/?e=102'); // Not authorized
    } else {
        res.render('goal/create', {
            title: 'Create New Goal | ' + sess.name,
            sess: sess
        });
    }

});

router.post('/save', function(req, res, next) {

    var goalType;

    if(!req.body.goalType) {
        goalType = "PERSONAL"
    } else {
        goalType = "ORGANIZATIONAL"
    }
    models.Goal.create({
        goal: req.body.goal,
        goalType: goalType,
        goalStatus: "PENDING",
        setDate: new Date(),
        deadline: req.body.deadline,
        progress: 0.0
    }).then(function (result) {
        return result.setUser(req.body.id);
    });
    res.redirect('/user/dashboard?m=101')
});

router.get('/list', function(req, res, next) {

    sh.checkSession(req, res);
    var sess = sh.getSession(req);
    
    if (sess.role !== "USER") {
        res.redirect('/?e=102'); // Not authorized
    } else {
        models.Goal.findAll({
            where: {
                UserId: sess.userId
            }
        }).then(function (goals) {
                res.render('goal/list', {
                    title: 'All My Goals | ' + sess.name,
                    goals: goals,
                    sess: sess
                });
        });
    }
});

router.get('/updateProgress', function(req, res, next){

    var id = req.query['id'];
    var progress = req.query['progress'];

    models.Goal.find({where:{
        id: id
    }}).then(function(goal) {
        if(goal){
            if(progress == 100) {
                goal.updateAttributes({
                    progress: progress,
                    goalStatus: "COMPLETED"
                });
            } else {
                goal.updateAttributes({
                    progress: progress
                });
            }
        }
    });
});

router.get('/action', function(req, res, next) {

    sh.checkSession(req, res);

    var id = req.query['g'];
    var action = req.query['q'];
    var sess = sh.getSession(req);

    if (sess.role !== "USER") {
        res.redirect('/?e=102'); // Not authorized
    } else {
        models.Goal.findOne({
            where: {
                id: id
            }
        }).then(function(goal){
            if(goal){
                goal.updateAttributes({
                    goalStatus: action,
                    setDate: new Date()
                }).then(function () {
                    res.redirect('/user/dashboard')
                });
            }
        });
    }
});

router.get('/sub-list', function(req, res, next) {

    sh.checkSession(req, res);

    var id = req.query['id'];
    var sess = sh.getSession(req);
    
    if (sess.role !== "USER") {
        res.redirect('/?e=102'); // Not authorized
    } else {
        models.Goal.findAll({
            where: {
                UserId: id
            }
        }).then(function (result) {
            models.User.findOne({
                where: {
                    id: id
                }
            }).then(function(subordinate){
                res.render('goal/sub-list', {
                    title: subordinate.name + ' | Subordinate Goals',
                    goals: result,
                    subordinate: subordinate,
                    sess: sess
                })
            });
        });
    }
});

module.exports = router;
