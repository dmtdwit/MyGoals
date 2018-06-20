var express = require('express');
var router = express.Router();
var models = require('../models');
var sh = require('../service/sessionHandler');

router.get('/', function (req, res, next) {
    res.redirect('/award/list');
});

router.get('/list', function (req, res, next) {
    models.Award.findAll({}).then(function (awards) {
        res.render('award/list',{
            title: 'Award List | MyGoals',
            awards: awards,
            sess: sh.getSession(req)
        });
    });
});

router.get('/create', function (req, res, next) {
   res.render('award/create',{
       title: 'Create Award | MyGoals',
       sess: sh.getSession(req)
   });
});


router.get('/save', function (req, res, next) {
    var title = req.query['title'];
    var iconName = req.query['iconName'];
    var iconColor = req.query['iconColor'];
    /*models.Award.findOne({
        where:{
            title: title
        }
    }).then(function (award) {
        var awardInstance = models.Award;
        awardInstance.title = title;
        awardInstance.iconName = iconName;
        awardInstance.iconColor = iconColor;
        res.render('award/create',{
            title: 'Create Award | MyGoals',
            award: awardInstance,
            sess: sh.getSession(req)
        });
    });*/
   models.Award.create({
       title: title,
       iconName: iconName,
       iconColor: iconColor
   }).then(function () {
       res.redirect('/award')
   });
});

router.get('/edit', function (req, res, next) {
    var id = req.query['id'];
    console.log("Id is Edit ",id);
    models.Award.findOne({
        where:{
            id: id
        }
    }).then(function (award) {
        res.render('award/edit.ejs', {
            title: 'Edit Award | My Goals',
            award: award,
            sess: sh.getSession(req)
        });
    });
});

router.get('/update', function (req, res, next) {
    var id = req.query['id'];
    models.Award.find({where:{
        id: id
    }}).then(function(award) {
       if(award){
           award.updateAttributes({
               title: req.query['title'],
               iconName: req.query['iconName'],
               iconColor: req.query['iconColor']
           }).then(function () {
               res.redirect('/award')
           });
       }
    });
});

router.get('/delete', function (req, res, next) {
    var id = req.query['id'];
    models.Award.destroy({
        where: {
            id: id
    }}).then(function () {
        res.redirect('/award')
    })
});

module.exports = router;