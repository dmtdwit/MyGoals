var express = require('express');
var router = express.Router();
var models = require('../models');
var sh = require('../service/sessionHandler');

router.get('/', function (req, res, next) {
    res.redirect('/award/list');
});

router.get('/list', function (req, res, next) {
    sh.checkSession(req, res);
    var sess = sh.getSession(req);

    if (sess.role === "USER") {
        res.redirect('/?e=102');
    }

    models.Award.findAll({}).then(function (awards) {
        res.render('award/list',{
            title: 'Award List | MyGoals',
            awards: awards,
            sess: sess
        });
    });
});

router.get('/get', function(req, res, next) {

    var id = req.query['id'];
    models.Award.findOne({
        where: {
            id: id
        }
    }).then(function(result){
        res.send(result);
    })
});

router.post('/getAll', function(req, res, next) {

    models.Award.findAll({}).then(function(result){
        res.send(result);
    });
});

router.get('/create', function (req, res, next) {
    sh.checkSession(req, res);
    var sess = sh.getSession(req);

    if (sess.role === "USER") {
        res.redirect('/?e=102');
    }
    res.render('award/create',{
       title: 'Create Award | MyGoals',
        sess: sess
   });
});


router.get('/save', function (req, res, next) {
    sh.checkSession(req, res);
    var sess = sh.getSession(req);

    if (sess.role === "USER") {
        res.redirect('/?e=102');
    }
    models.Award.create({
       title: req.query['title'],
       iconName: req.query['iconName'],
       iconColor: req.query['iconColor']
   }).then(function () {
       res.redirect('/award')
   });
});

router.get('/edit', function (req, res, next) {
    sh.checkSession(req, res);
    var sess = sh.getSession(req);

    if (sess.role === "USER") {
        res.redirect('/?e=102');
    }
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
            sess: sess
        });
    });
});

router.get('/update', function (req, res, next) {
    sh.checkSession(req, res);
    var sess = sh.getSession(req);

    if (sess.role === "USER") {
        res.redirect('/?e=102');
    }
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
    sh.checkSession(req, res);
    var sess = sh.getSession(req);

    if (sess.role === "USER") {
        res.redirect('/?e=102');
    }
    var id = req.query['id'];
    models.Award.destroy({
        where: {
            id: id
    }}).then(function () {
        res.redirect('/award')
    })
});

module.exports = router;