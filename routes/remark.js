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

router.get('/getRemarks', function(req, res, next) {

    let goalId = req.query['goalId'];

    models.Remark.findAll({
        where: {
            GoalId: goalId
        }
    }).then(function(result){
        res.send(result);
    })
});

router.post('/create', function(req, res, next){

   models.Remark.create({
       remark: req.body.remark,
       GoalId: req.body.goalIdForRemark,
       RemarkById: req.body.userId
   }).then(function(result){
       models.Goal.findOne({
           where: {
               id: req.body.goalIdForRemark
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
                               subject: 'New remark on goal | Deerwalk Goals',
                               text: 'Hello '+ user.name + ',\n\n' +
                               remarkBy.name + ' made a remark "' + req.body.remark + '" on "' + goal.goal + '". \n\n' +
                               'Have a look at ' + sh.getBaseUrl() + 'goal/show/' + req.body.goalId + '\n\n' +
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
                                   subject: 'New remark on goal | Deerwalk Goals',
                                   text: 'Hello '+ manager.name + ',\n\n' +
                                   remarkBy.name + ' made a remark "' + req.body.remark + '" on "' + goal.goal + '". \n\n' +
                                   'Have a look at ' + sh.getBaseUrl() + 'goal/show/' + req.body.goalId + '\n\n' +
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
                   res.redirect("/goal/log/show/" + req.body.goalIdForRemark);
               })
           });
       if(req.body.allSubordinates) {
           res.redirect("/goal/all-subordinate-goals");
       } else if (req.body.list) {
           res.redirect("/goal/list");
       } else {
           res.redirect("/goal/subordinate/" + req.body.subordinateId);
       }
   });
});


module.exports = router;