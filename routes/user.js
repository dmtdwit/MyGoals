var express = require('express');
var router = express.Router();
var models = require('../models');
var fs = require('fs');
// var md5 = require('md5');
var sh = require('../service/sessionHandler');
var formidable = require('formidable');

router.get('/create', function(req, res, next) {

    sh.checkSession(req, res);
    var sess = sh.getSession(req);

    if (sess.role === "USER") {
        res.redirect('/?e=102'); // Not authorized
    } else {
        models.User.findAll({}).then(function (users) {
            res.render('user/create', {
                title: 'Create New User',
                users: users,
                sess: sess
            });
        });
    }
});

router.get('/edit', function(req, res, next) {

    sh.checkSession(req, res);

        var id = req.query['id'];

        models.User.findAll({}).then(function (users) {
            models.User.findOne({where: {id: id}}).then(function (user) {
                res.render('user/edit', {
                    title: 'Edit User | My Goals',
                    firstName: user.name.split(" ")[0],
                    lastName: user.name.split(" ")[1],
                    user: user,
                    users: users
                });
            });
        });

});

router.post('/save', function(req, res, next) {

    sh.checkSession(req, res);

    var category, role;

    if(!req.body.role) {
        role = 2
    } else {
        role = 1
    }

    if(!req.body.category) {
        category = "EMPLOYEE"
    } else {
        category = "STUDENT"
    }

    models.User.create({
        name: req.body.firstName + " " + req.body.lastName,
        password: req.body.email,
        email: req.body.email,
        category: category
    }).then(function(result){
        return result.setRole(role);
    }).then(function(resultTwo){
        return resultTwo.setManager(req.body.manager);
    });

    res.redirect("/admin/dashboard");
});

router.get('/profile', function(req, res, next) {

    sh.checkSession(req, res);

    var id = req.query['id'];

    models.User.findOne({
        where: {
            id: id
        }
    }).then(function (user) {
        models.User.findOne({
            where: {
                id: user.ManagerId
            }
        }).then(function (manager) {
            models.User.findAll({
                where: {
                    managerId: user.id
                }
            }).then(function (subordinates) {
                models.Goal.findAll({
                    where: {
                        UserId: user.id
                    }
                }).then(function (goals) {
                    res.render('user/profile', {
                        title: user.name + ' | User Profile',
                        user: user,
                        manager: manager,
                        subordinates: subordinates,
                        goals: goals,
                        sess: sh.getSession(req)
                    });
                });
            });
        });
    });
});

router.get('/list', function(req, res, next) {

    sh.checkSession(req, res);

    models.User.findAll({
        where: {
            RoleId: 2
        }
    }).then(function(users) {
        res.render('user/list', {
            title: 'All Users',
            users: users,
            sess: sh.getSession(req)
        });
    });
});

router.get('/subordinates', function(req, res, next){

    sh.checkSession(req, res);

    var sess= sh.getSession(req);

    if (sess.role !== "USER") {
        res.redirect('/?e=102'); // Not authorized
    } else {
        models.User.findAll({
            where: {
                ManagerId: sess.userId
            }
        }).then(function (subordinates) {
            res.render('user/subordinates',{
                title: 'Subordinates',
                subordinates: subordinates,
                sess: sess
            })
        });
    }

});

router.get('/dashboard', function(req, res, next) {

    sh.checkSession(req, res);

    if (sh.getSession(req).role !== "USER") {
        res.redirect('/?e=102'); // Not authorized
    } else {
        models.User.findOne({
            where: {
                ManagerId: sh.getSession(req).userId
            }
        }).then(function(result){

            res.render('user/dashboard',
                {
                    title: 'Dashboard',
                    sess: sh.getSession(req),
                    subordinate: result
                }
            );
        });
    }
});

router.get('/profilePicture', function (req, res, next) {
    res.render('user/profilePicture',
        {
            title: 'Edit Profile Picture | MyGoals',
            sess: sh.getSession(req)
        }
    );
});

router.post('/savePP', function (req, res, next) {
    var sess = sh.getSession(req);
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var oldpath = files.profilePicture.path;
        oldFilename = files.profilePicture.name;
        arrayOfFilename = oldFilename.split('.');
        fileExt = arrayOfFilename[arrayOfFilename.length-1];
        newFilename = sess.userId+'.'+fileExt;
        var newpath = '../MyGoals/public/profilePictures/' + newFilename;
        fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;
            models.User.findOne({
                where:{
                    id: sess.userId
                }
            }).then(function (user) {
                if(user){
                    user.updateAttributes({
                        imageName: newFilename
                    }).then(function () {
                        res.redirect('./profile?id='+sess.userId)
                    });
                }
            });
        });
    });
});

module.exports = router;
