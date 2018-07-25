const express = require('express');
const router = express.Router();
const models = require('../models');
const sh = require('../service/sessionHandler');

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
        res.redirect("/goal/view-log?id=" + req.body.goalId);
    });
});

module.exports = router;