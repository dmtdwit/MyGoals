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
                res.redirect("/goal/list?e=102"); // Personal goal count is 1
            } else if (goalType === "ORGANIZATIONAL" && goalCountOrg >= 2) {
                res.redirect("/goal/list?e=103"); // Organizational goal count is 2
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
                res.redirect('/goal/list?e=101');
            }
        })
    });
});

router.post('/log', function(req, res, next){

    models.Log.create({
        remark: req.body.progressRemark,
        progressMade: req.body.progressMade
    }).then(function (result) {
        return result.setGoal(req.body.progressGoalId);
    }).then(function(){
        res.redirect("/goal/view-log?id="+ req.body.progressGoalId +"&e=201"); // Progress successfully updated
    })
});

router.get('/view-log', function(req, res, next) {

    sh.checkSession(req, res);
    let sess = sh.getSession(req);
    let c = req.query['e'];
    let message, type;

    switch(c) {
        case "201":
            message = "Log successfully updated.";
            type = "success";
            break;
        default:
            message = "";
            type = "";
    }

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
                    title: 'Log | ' + goal.goal,
                    goal: goal,
                    logs: logs,
                    sess: sess,
                    message: message,
                    messageType: type
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
    let c = req.query['e'];
    let message, type;

    switch(c) {
        case "101":
            message = "Goal successfully created.";
            type = "success";
            break;
        case "102":
            message = "You can only have 1 personal goal running/pending.";
            type = "warning";
            break;
        case "103":
            message = "You can only have 2 organizational goals running/pending.";
            type = "warning";
            break;
        case "402":
            message = "Award cannot be updated as award with same name already exists.";
            type = "error";
            break;
        case "403":
            message = "Award cannot be updated as award with given information doesn't exist.";
            type = "error";
            break;
        case "404":
            message = "Award cannot be deleted as award has been assigned to some goals.";
            type = "error";
            break;
        case "405":
            message = "Award cannot be deleted as award with given information doesn't exist.";
            type = "error";
            break;
        default:
            message = "";
            type = "";
    }


    if (sess.role !== "USER") {
        res.redirect('/?e=102'); // Not authorized
    } else {
        models.Goal.findAll({
            where: {
                UserId: sess.userId
            },
            order: [
                ['id', 'DESC']
            ]
        }).then(function (goals) {
                res.render('goal/list', {
                    title: 'All My Goals | ' + sess.name,
                    goals: goals,
                    sess: sess,
                    message: message,
                    messageType: type
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
            if(progress === 100) {
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

router.get('/all-subordinate-goals', function(req, res, next) {

    sh.checkSession(req, res);

    let sess = sh.getSession(req);

    if (sess.role !== "USER") {
        res.redirect('/?e=102'); // Not authorized
    } else {
        models.User.findAll({
            where: {
                ManagerId: sess.userId
            }
        }).then(function (subordinates) {
            res.render('goal/all-subordinate-goals',{
                title: "Subordinates' Goals",
                subordinates: subordinates,
                sess: sess
            })
        })
    }
});

router.get('/getAllGoals', function(req, res, next) {

    let userId = req.query['userId'];

    models.Goal.findAll({
        where: {
            UserId: userId
        }
    }).then(function(goals){
       res.send(goals);
    });
});

module.exports = router;
