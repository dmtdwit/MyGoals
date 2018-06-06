var express = require('express');
var router = express.Router();
var models = require('../models');

router.get('/', function (req, res, next) {
    res.redirect('/award/list');
});

router.get('/list', function (req, res, next) {
    models.Award.findAll({}).then(function (awards) {
        res.render('award/list',{
            title: 'Award List | MyGoals',
            awards: awards
        });
    });
});

router.get('/create', function (req, res, next) {
   res.render('award/create',{
       title: 'Create Award | MyGoals'
   });
});


router.get('/save', function (req, res, next) {
    console.log("Title is ",req.param('title'));
   models.Award.create({
       title: req.param('title')
   }).then(function () {
       res.redirect('/award')
   });
});

router.get('/edit', function (req, res, next) {
    var id = req.param('id');
    console.log("Id is ",id);
    // console.log("Award is ", models.Award.findById(id));
    models.Award.find({where:{id: id}}).then(function (award) {
        res.render('award/edit.ejs',{
            title: 'Edit Award | My Goals',
            award: award
        });
    });
});

module.exports = router;