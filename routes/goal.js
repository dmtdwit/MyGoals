const express = require('express');
const router = express.Router();
const models = require('../models');
const sh = require('../service/sessionHandler');
const Sequelize = require('sequelize');

const Op = Sequelize.Op;

router.get('/create', function(req, res, next) {

    sh.checkSession(req, res);
    let sess = sh.getSession(req);

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

    let goalType;

    if(!req.body.goalType) {
        goalType = "PERSONAL"
    } else {
        goalType = "ORGANIZATIONAL"
    }

    models.Goal.count({
       where: {
           UserId: req.body.id,
           goalStatus: {
               [Op.or]: ["PENDING", "APPROVED"]
           },
           goalType: "ORGANIZATIONAL"
       }
    }).then(function(goalCountOrg){
        models.Goal.count({
            where: {
                UserId: req.body.id,
                goalStatus: {
                    [Op.or]: ["PENDING", "APPROVED"]
                },
                goalType: "PERSONAL"
            }
        }).then(function(goalCountPers){
            if (goalType === "PERSONAL" && goalCountPers >= 1) {
                res.redirect("/user/dashboard?e=111"); // Personal goal count is 1
            } else if (goalType === "ORGANIZATIONAL" && goalCountOrg >= 2) {
                res.redirect("/user/dashboard?e=222"); // Organizational goal count is 2
            } else {
                models.User.findOne({
                    where: {
                        id: req.body.id
                    }
                }).then(function(user){
                    if(!user.ManagerId) {
                        models.Goal.create({
                            goal: req.body.goal,
                            goalType: goalType,
                            goalStatus: "APPROVED",
                            setDate: new Date(),
                            deadline: req.body.deadline,
                            progress: 0.0,
                            approvedDate: new Date()
                        }).then(function (result) {
                            return result.setUser(req.body.id);
                        });
                    } else {
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
                    }
                });
                res.redirect('/user/dashboard?m=101');
            }
        })
    });
});

router.post('/log', function(req, res, next){

    models.Log.create({
        remark: req.body.progressRemark
    }).then(function (result) {
        return result.setGoal(req.body.progressGoalId);
    }).then(function(){
        res.redirect("/goal/list");
    })
});

router.get('/view-log', function(req, res, next) {

    sh.checkSession(req, res);
    let sess = sh.getSession(req);

    if (sess.role !== "USER") {
        res.redirect('/?e=102'); // Not authorized
    } else {
        models.Goal.findOne({
            where: {
                id: req.query['id']
            }
        }).then(function(goal){
            models.Log.findAll({
                where: {
                    GoalId: req.query['id']
                }
            }).then(function (logs) {
                res.render('goal/log', {
                    title: 'Log | ' + sess.name,
                    goal: goal,
                    logs: logs,
                    sess: sess
                });
            });
        });
    }
});

router.post('/award', function(req, res, next) {

    models.Goal.find({where:{
        id: req.body.goalId
    }}).then(function(goal) {
        if(goal){
            goal.updateAttributes({
                AwardId: req.body.award
            });
        }
        res.redirect('/goal/sub-list?id=' + req.body.userId);
    });
});

router.get('/list', function(req, res, next) {

    sh.checkSession(req, res);
    let sess = sh.getSession(req);
    
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

    let id = req.query['id'];
    let progress = req.query['progress'];

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

    let id = req.query['g'];
    let action = req.query['q'];
    let user = req.query['u'];
    let sess = sh.getSession(req);

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
                    approvedDate: new Date()
                }).then(function () {
                    res.redirect('/goal/sub-list?id=' + user);
                });
            }
        });
    }
});

router.get('/sub-list', function(req, res, next) {

    sh.checkSession(req, res);

    let id = req.query['id'];
    let sess = sh.getSession(req);
    
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
