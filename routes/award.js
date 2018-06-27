const express = require('express');
const router = express.Router();
const models = require('../models');
const sh = require('../service/sessionHandler');

router.get('/', function (req, res, next) {
    res.redirect('/award/list');
});

router.get('/list', function (req, res, next) {
    sh.checkSession(req, res);
    var c = req.query['e'];
    var message, type;

    switch(c) {
        case "201":
            message = "New award successfully created.";
            type = "success";
            break;
        case "202":
            message = "Award successfully updated.";
            type = "success";
            break;
        case "203":
            message = "Award successfully deleted.";
            type = "success";
            break;
        case "401":
            message = "New award cannot be created as award with same name already exists.";
            type = "error";
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


    let sess = sh.getSession(req);

    if (sess.role === "USER") {
        res.redirect('/login?e=403');
    }

    models.Award.findAll({}).then(function (awards) {
        res.render('award/list',{
            title: 'Award List | MyGoals',
            awards: awards,
            sess: sess,
            message: message,
            messageType: type
        });
    });
});

router.get('/get', function(req, res, next) {

    let id = req.query['id'];
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
    let sess = sh.getSession(req);

    if (sess.role === "USER") {
        res.redirect('/login?e=102');
    }
    res.render('award/create',{
       title: 'Create Award | MyGoals',
        sess: sess
   });
});


router.get('/save', function (req, res, next) {
    sh.checkSession(req, res);
    let sess = sh.getSession(req);

    if (sess.role === "USER") {
        res.redirect('/?e=102');
    }
    models.Award.findAll({
        where:{
            title: req.query['title']
        }
    }).then(function (awardsList) {
        if(awardsList.length===0){
            models.Award.create({
                title: req.query['title'],
                iconName: req.query['iconName'],
                iconColor: req.query['iconColor']
            }).then(function () {
                res.redirect('/award/list?e=201')
            });
        }else{
            res.redirect('/award/list?e=401')
        }
    });
});

router.get('/edit', function (req, res, next) {
    sh.checkSession(req, res);
    let sess = sh.getSession(req);

    if (sess.role === "USER") {
        res.redirect('/login?e=403');
    }
    let id = req.query['id'];
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
    let sess = sh.getSession(req);

    if (sess.role === "USER") {
        res.redirect('/?e=102');
    }
    let id = req.query['id'];
    models.Award.find({where:{
        id: id
    }}).then(function(award) {
       if(award){
           models.Award.findAll({
               where:{
                   title: req.query['title']
               }
           }).then(function (awardsList) {
              if(awardsList.length===0||award.title===req.query['title']){
                  award.updateAttributes({
                      title: req.query['title'],
                      iconName: req.query['iconName'],
                      iconColor: req.query['iconColor']
                  }).then(function () {
                      res.redirect('/award/list?e=202')
                  });
              }else{
                  res.redirect('/award/list?e=402')
              }
           });
       }else{
           res.redirect('/award/list?e=403')
       }
    });
});

router.get('/delete', function (req, res, next) {
    sh.checkSession(req, res);
    let sess = sh.getSession(req);

    if (sess.role === "USER") {
        res.redirect('/?e=102');
    }
    let id = req.query['id'];
    models.Award.findOne({
        where:{
            id: id
        }
    }).then(function (award) {
       if(award){
           award.destroy().then(function () {
               res.redirect('/award/list?e=203')
           })
       } else{
           res.redirect('/award/list?e=405')
       }
    });
});

module.exports = router;