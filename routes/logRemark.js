const express = require('express');
const router = express.Router();
const models = require('../models');
const sh = require('../service/sessionHandler');

const formidable = require('formidable');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rnd@deerwalk.edu.np',
        pass: 'i am hero'
    }
});

router.get('/getLogRemarks', function(req, res, next) {

    let logId = req.query['logId'];

    models.LogRemark.findAll({
        where: {
            LogId: logId
        }
    }).then(function(result){
        res.send(result);
    })
});

router.post('/create', function(req, res, next){

    models.LogRemark.create({
        remark: req.body.remark,
        LogId: req.body.logIdForRemark,
        RemarkById: req.body.userId
    }).then(function(result){
        models.Log.findOne({
            where: {
                id: req.body.logIdForRemark
            }
        }).then(function(log){
            models.Goal.findOne({
                where: {
                    id: log.GoalId
                }
            }).then(function(goal){
                models.User.findOne({
                    where: {
                        id: goal.UserId
                    }
                }).then(function(user){
                    models.User.findOne({
                        where: {
                            id: req.body.userId
                        }
                    }).then(function(remarkBy){
                        if (user.id !== remarkBy.id) {
                            let mailOptions = {
                                from: 'rnd@deerwalk.edu.np',
                                to: user.email,
                                subject: 'New remark on log | Deerwalk Goals',
                                text: 'Hello '+ user.name + ',\n\n' +
                                remarkBy.name + ' made a log remark "' + req.body.remark + '" on "' + log.remark + '". \n\n' +
                                'Have a look at ' + sh.getBaseUrl() + 'goal/log/show/' + req.body.goalId + '\n\n' +
                                'Deerwalk Goals Team'
                            };
                            transporter.sendMail(mailOptions, function(error, info){
                                if (error) {
                                    console.log(error);
                                } else {
                                    console.log('Email sent: ' + info.response);
                                }
                            });
                        } else {
                            models.User.findOne({
                                where: {
                                    id: user.ManagerId
                                }
                            }).then(function(manager){
                                let mailOptions = {
                                    from: 'rnd@deerwalk.edu.np',
                                    to: manager.email,
                                    subject: 'New remark on log | Deerwalk Goals',
                                    text: 'Hello '+ manager.name + ',\n\n' +
                                    remarkBy.name + ' made a log remark "' + req.body.remark + '" on "' + log.remark + '". \n\n' +
                                    'Have a look at ' + sh.getBaseUrl() + 'goal/log/show/' + req.body.goalId + '\n\n' +
                                    'Deerwalk Goals Team'
                                };
                                transporter.sendMail(mailOptions, function(error, info){
                                    if (error) {
                                        console.log(error);
                                    } else {
                                        console.log('Email sent: ' + info.response);
                                    }
                                });
                            });
                        }
                    });
                    res.redirect("/goal/log/show/" + req.body.goalId);
                })
            })
        });
    });
});

module.exports = router;