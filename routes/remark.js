const express = require('express');
const router = express.Router();
const models = require('../models');
const sh = require('../service/sessionHandler');

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
       if(req.body.allSubordinates) {
           res.redirect("/goal/all-subordinate-goals");
       } else if (req.body.list) {
           res.redirect("/goal/list");
       } else {
           res.redirect("/goal/sub-list?id=" + req.body.subordinateId);
       }
   });
});


module.exports = router;