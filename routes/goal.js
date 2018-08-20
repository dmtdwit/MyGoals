const express = require('express');
const router = express.Router();
const models = require('../models');
const sh = require('../service/sessionHandler');
const Sequelize = require('sequelize');

const Op = Sequelize.Op;

const formidable = require('formidable');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rnd@deerwalk.edu.np',
        pass: 'i am hero'
    }
});

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
                        }).then(function(result){
                            models.User.findOne({
                                where: {
                                    id: req.body.id
                                }
                            }).then(function(user){
                                models.User.findOne({
                                    where: {
                                        id: user.ManagerId
                                    }
                                }).then(function(manager){
                                    let mailOptions = {
                                        from: 'rnd@deerwalk.edu.np',
                                        to: manager.email,
                                        subject: user.name + ' created a new goal | MyGoals',
                                        text: 'Hello '+ manager.name + ',\n\n' +
                                            user.name + ' has created a new goal "' + req.body.goal + '". \n\n' +
                                            'Have a look at ' + sh.getBaseUrl() + 'goal/show/' + result.id + '\n\n' +
                                            'My Goals Team'
                                    };
                                    transporter.sendMail(mailOptions, function(error, info){
                                        if (error) {
                                            console.log(error);
                                        } else {
                                            console.log('Email sent: ' + info.response);
                                        }
                                    });
                                });
                            });
                        });
                    }
                });
                res.redirect('/goal/list?e=101');
            }
        })
    });
});

router.get('/show/:id', function(req, res, next) {

    sh.checkSession(req, res);
    let sess = sh.getSession(req);

    if (sess.role !== "USER") {
        res.redirect('/?e=102'); // Not authorized
    } else {
        let goalId = req.params.id;

        models.Goal.findOne({
            where: {
                id: goalId
            }
        }).then(function(goal){
            models.User.findOne({
                where: {
                    id: goal.UserId
                }
            }).then(function(user){

                if (sess.userId != user.id) {
                    if( sess.userId != user.ManagerId) {
                        res.redirect('/user/dashboard');
                    }
                }

                // if (sess.userId != user.ManagerId) {
                //     if (sess.userId != user.id) {
                //         res.redirect('/user/dashboard');
                //     }
                // }

                    res.render('goal/show', {
                        title: 'Goal | My Goals',
                        goal: goal,
                        user: user,
                        sess: sh.getSession(req)
                    });
            });
        });
    }
});

router.post('/log', function(req, res, next){

    let sess = sh.getSession(req);

    if (req.body.progressValue > 100 || req.body.progressValue < 0) {
        res.redirect('/goal/list?e=104'); // Invalid progress update
    }

    models.Log.create({
        remark: req.body.progressRemark,
        progressMade: req.body.progressMade
    }).then(function (result) {
        return result.setGoal(req.body.progressGoalId);
    }).then(function(result){

        models.User.findOne({
            where: {
                id: sess.userId
            }
        }).then(function(user){
            models.User.findOne({
                where: {
                    id: user.ManagerId
                }
            }).then(function(manager){
                models.Goal.findOne({
                    where: { id: log.GoalId}
                }).then(function(goal){
                    let mailOptions = {
                        from: 'rnd@deerwalk.edu.np',
                        to: manager.email,
                        subject: user.name + ' updated his progress | MyGoals',
                        text: 'Hello '+ manager.name + ',\n\n' +
                        user.name + ' has updated his progress log with remark "' + req.body.progressRemark + '" (' +
                        req.body.progressMade + '%). \n\n' +
                        'Have a look at ' + sh.getBaseUrl() + 'goal/log/show/' + goal.id + '\n\n' +
                        'MyGoals Team'
                    };
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                });
            })
        });

        res.redirect("/goal/log/show/"+ req.body.progressGoalId +"?e=201"); // Progress successfully updated
    })
});

router.get('/log/show/:id', function(req, res, next) {

    sh.checkSession(req, res);
    let sess = sh.getSession(req);
    let id = req.params.id;
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
                        id: id
                    }
                }).then(function (goal) {
                    models.Log.findAll({
                        where: {
                            GoalId: id
                        }
                    }).then(function (logs) {
                        res.render('goal/log', {
                            title: 'Goal Log',
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
            }).then(function(goal){
                models.User.findOne({
                    where: {
                        id: goal.UserId
                    }
                }).then(function(user){
                    let mailOptions = {
                        from: 'rnd@deerwalk.edu.np',
                        to: user.email,
                        subject: 'You have been given an award | MyGoals',
                        text: 'Hello '+ user.name + ',\n\n' +
                        'You have been given an award for your goal "' + goal.goal + '". \n\n' +
                        'Have a look at ' + sh.getBaseUrl() + 'goal/show/' + goal.id + '\n\n' +
                        'My Goals Team'
                    };
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                    res.redirect('/goal/subordinate/' + req.body.userId + '?e=101'); // Action successfully completed
                })
            });
        }
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
        case "104":
            message = "Invalid progress value.";
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

    if (progress > 100 || progress < 0) {
        res.redirect('/list?e=104'); // Invalid progress update
    }

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
    let userId = req.query['u'];
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
                }).then(function (goal) {
                    models.User.findOne({
                        where: {
                            id: goal.UserId
                        }
                    }).then(function(user){
                        let mailOptions = {
                            from: 'rnd@deerwalk.edu.np',
                            to: user.email,
                            subject: 'Your goal has been ' + action + ' | MyGoals',
                            text: 'Hello '+ user.name + ',\n\n' +
                            'Your goal "' + goal.goal + '" has been ' + action + '. \n\n' +
                            'Have a look at ' + sh.getBaseUrl() + 'goal/show/' + goal.id + '\n\n' +
                            'My Goals Team'
                        };
                        transporter.sendMail(mailOptions, function(error, info){
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email sent: ' + info.response);
                            }
                        });
                        res.redirect('/goal/subordinate/' + userId + '?e=101'); // Action successfully completed
                    });
                });
            }
        });
    }
});

router.get('/subordinate/:id', function(req, res, next) {

    sh.checkSession(req, res);

    let id = req.params.id;
    let sess = sh.getSession(req);
    let c = req.query['e'];
    let message, type;

    switch(c) {
        case "101":
            message = "Action successfully completed.";
            type = "success";
            break;
        default:
            message = '';
            type = '';
    }
    
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
                    sess: sess,
                    message: message,
                    messageType: type
                })
            });
        });
    }
});

router.get('/allSubordinates', function(req, res, next) {

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

router.get('/print', function(req, res, next) {

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
            res.render('goal/print',{
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
