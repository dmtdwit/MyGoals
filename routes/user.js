const express = require('express');
const router = express.Router();
const models = require('../models');
const fs = require('fs');
const md5 = require('md5');
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

router.get('/create', function(req, res, next) {

    sh.checkSession(req, res);
    let sess = sh.getSession(req);

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

router.get('/password', function(req, res, next) {

    sh.checkSession(req, res);
    let sess = sh.getSession(req);
    const c = req.query['e'];
    let message, type;

    switch(c){
        case "101":
            message = 'Password successfully updated!';
            type = 'success';
            break;
        case "102":
            message = 'Update failed. Password doesn\'t match. !';
            type = 'error';
            break;
        default:
            message = '';
            type = '';
    }

    if (sess.role !== "USER") {
        res.redirect('/?e=102'); // Not authorized
    } else {
        models.User.findOne({
            where: {
                id: sess.userId
            }
        }).then(function(user){
            res.render('user/password', {
                title: 'Change Password | ' + sess.name,
                user: user,
                sess: sess,
                message: message,
                messageType: type
            });
        })
    }
});

router.post('/updatePassword', function(req, res, next){

    let sess = sh.getSession(req);

    models.User.findOne({
        where: {
            id: sess.userId
        }
    }).then(function(user){

        if (md5(req.body.oldPassword) === user.password) {

            if (req.body.newPassword === req.body.rePassword) {
                user.updateAttributes({
                    password: md5(req.body.newPassword)
                });
                res.redirect('/user/password?e=101'); // Password successfully updated.
            } else {
                res.redirect('/user/password?e=102'); // Password is not verified.
            }
        } else {
            res.redirect('/user/password?e=102'); // Password is not verified.
        }
    });
});

router.get('/checkPassword', function(req, res, next){

    models.User.findOne({
        where: {
            id: req.query['userId'],
            password: md5(req.query['password'])
        }
    }).then(function(user){
        res.send(user);
    });
});

router.get('/edit/:id', function(req, res, next) {

    sh.checkSession(req, res);
    let sess = sh.getSession(req);

    let id = req.params.id;
    console.log(sess.role);
    if (sess.role == "USER") {
        res.redirect('/?e=102'); // Not authorized
    } else {
        models.User.findAll({}).then(function (users) {
            models.User.findOne({where: {id: id}}).then(function (user) {
                models.User.findOne({
                    where: {
                        id: user.ManagerId
                    }
                }).then(function (manager) {
                    let managerId = 0;
                    if (manager !== null) {
                        managerId = manager.id
                    }
                    res.render('user/edit', {
                        title: 'Edit User | My Goals',
                        firstName: user.name.split(" ")[0],
                        lastName: user.name.split(" ")[1],
                        user: user,
                        users: users,
                        managerId: managerId,
                        sess: sess
                    });
                });
            });
        });
    }
});

router.post('/update', function(req, res, next) {

    sh.checkSession(req, res);
    let category, role;
    const id = req.body.id;

    models.User.findOne({
        where:{
            id: id
        }
    }).then(function (user) {
        if(req.body.role) {
            role = 2
        } else {
            role = 3
        }
        console.log("User is ", user);
        if(user){
            models.User.findAll({
                where:{
                    email: req.body.email
                }
            }).then(function (usersList) {
                if(usersList.length===0||user.email===req.body.email){
                    user.updateAttributes({
                        name: req.body.firstName + " " + req.body.lastName,
                        password: req.body.email,
                        email: req.body.email,
                        category: req.body.category
                    }).then(function(result){
                        return result.setRole(role);
                    }).then(function(resultTwo){
                        if(req.body.manager===0||req.body.manager==='0'){
                            return resultTwo;
                        }else{
                            return resultTwo.setManager(req.body.manager);
                        }
                    });
                    res.redirect("/user/list?e=202"); // user updated successfully
                }else{
                    res.redirect("/user/list?e=402"); // user with that email already exists
                }
            });
        }else {
            res.redirect("/user/list?e=403"); // user not found for updating information
        }
    });
});

router.post('/save', function(req, res, next) {

    sh.checkSession(req, res);

    let role;

    if(!req.body.role) {
        role = 3
    } else {
        role = 2
    }

    models.User.findAll({
        where:{
            email: req.body.email + req.body.address
        }
    }).then(function (userList) {
       if(userList.length===0){
           models.User.create({
               name: req.body.firstName + " " + req.body.lastName,
               password: md5(md5(req.body.email)),
               email: req.body.email + req.body.address,
               category: req.body.category
           }).then(function(result){
               return result.setRole(role);
           }).then(function(resultTwo){
               if(req.body.manager===0||req.body.manager==='0'){
                   return resultTwo.setManager(0)
               }else{
                   return resultTwo.setManager(req.body.manager);
               }
           }).then(function (result3) {
               let mailOptions = {
                   from: 'rnd@deerwalk.edu.np',
                   to: result3.email,
                   subject: 'Credentials | MyGoals',
                   text: 'Hello '+req.body.firstName+',\n\nYour account for MyGoals application has been created. \n\n\tUsername: ' + result3.email.split('@')[0] + '\n\tPassword: '+ md5(req.body.email) +'\n\nPlease use this credentials to sign in.\n\nThanks,\nMyGoals Team'
               };
               transporter.sendMail(mailOptions, function(error, info){
                   if (error) {
                       console.log(error);
                   } else {
                       console.log('Email sent: ' + info.response);
                   }
               });
           });
           res.redirect("/user/list?e=201"); // user created successfully
       }else{
           res.redirect("/user/list?e=401"); // user with same email already exits
       }
    });
});

router.get('/profile', function(req, res, next) {

    sh.checkSession(req, res);
    let sess = sh.getSession(req);

    let id = sess.userId;
    const c = req.query['e'];
    let message, type;

    switch(c) {
        case "204":
            message = "New profile picture successfully saved.";
            type = "success";
            break;
        case "205":
            message = "No new profile picture selected.";
            type = "warning";
            break;
        default:
            message = "";
            type = "";
    }
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
                        sess: sess,
                        message: message,
                        messageType: type
                    });
                });
            });
        });
    });
});

router.get('/list', function(req, res, next) {

    sh.checkSession(req, res);
    const c = req.query['e'];
    let message, type;

    switch(c) {
        case "201":
            message = "User successfully created.";
            type = "success";
            break;
        case "202":
            message = "User successfully updated.";
            type = "success";
            break;
        case "203":
            message = "User successfully deleted.";
            type = "success";
            break;
        case "401":
            message = "User cannot be created as user with same email already exists.";
            type = "error";
            break;
        case "402":
            message = "User cannot be updated as user with same email already exists.";
            type = "error";
            break;
        case "403":
            message = "User cannot be updated as user with given information doesn't exist.";
            type = "error";
            break;
        case "404":
            message = "User cannot be deleted as user has replies in some remarks.";
            type = "error";
            break;
        case "405":
            message = "User cannot be deleted as user has some remarks.";
            type = "error";
            break;
        case "406":
            message = "User cannot be deleted as user has some goals.";
            type = "error";
            break;
        case "407":
            message = "User cannot be deleted as user has been assigned as manager for someone.";
            type = "error";
            break;
        case "408":
            message = "User cannot be deleted as user doesn't exist.";
            type = "error";
            break;
        default:
            message = "";
            type = "";
    }

    models.User.findAll({
        where: {
            RoleId: 2
        }
    }).then(function(users) {
        res.render('user/list', {
            title: 'All Users',
            users: users,
            sess: sh.getSession(req),
            message: message,
            messageType: type
        });
    });
});

router.get('/getManager', function(req, res, next){

    models.User.findOne({
        where: {
            id: req.query['id']
        }
    }).then(function(user){
        models.User.findOne({
            where: {
                id: user.ManagerId
            }
        }).then(function(manager){
            res.send(manager);
        });
    });
});

router.get('/getUser', function(req, res, next){

    let userId = req.query['userId'];

    models.User.findOne({
        where: {
            id: userId
        }
    }).then(function(result){
        res.send(result);
    })
});

router.get('/getAllSubordinates', function(req, res, next){

    let userId = req.query['userId'];

    models.User.findAll({
        where: {
            ManagerId: userId
        }
    }).then(function(subordinates){
       res.send(subordinates) ;
    });
});

router.get('/subordinates', function(req, res, next){

    sh.checkSession(req, res);

    let sess= sh.getSession(req);

    if (sess.role !== "USER") {
        return res.redirect('/login?e=403'); // Not authorized
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
        return res.redirect('/login?e=403'); // Not authorized
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
    let sess = sh.getSession(req);
    let form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        let oldpath = files.profilePicture.path;
        oldFilename = files.profilePicture.name;
        arrayOfFilename = oldFilename.split('.');
        fileExt = arrayOfFilename[arrayOfFilename.length-1];
        newFilename = sess.userId+'.'+fileExt;
        let newpath = '../public/profilePictures/' + newFilename;
        if(oldFilename!==''&&oldFilename!==null){
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
                            res.redirect('./profile?e=204&id='+sess.userId)
                        });
                    }
                });
            });
        }else{
            models.User.findOne({
                where:{
                    id: sess.userId
                }
            }).then(function (user) {
                if(user){
                    res.redirect('./profile?e=205&id='+sess.userId)
                }
            });
        }
    });
});

router.get('/delete', function (req, res, next) {
   const id = req.query['id'];
   models.User.findOne({
       where:{
           id: id
       }
   }).then(function (userToDelete) {
       if(userToDelete){
           models.User.findAll({
               where:{
                   ManagerId: userToDelete.id
               }
           }).then(function (managers) {
               if(managers.length===0){
                    models.Goal.findAll({
                        where:{
                            UserId: userToDelete.id
                        }
                    }).then(function (goals) {
                        if(goals.length===0){
                            models.Remark.findAll({
                                where:{
                                    RemarkById: userToDelete.id
                                }
                            }).then(function (remarks) {
                                if(remarks.length===0){
                                    models.Reply.findAll({
                                        where:{
                                            RepliedById: userToDelete.id
                                        }
                                    }).then(function (replies) {
                                       if(replies.length===0){
                                           models.User.destroy({
                                               where: {
                                                   id: id
                                               }
                                           }).then(function () {
                                               res.redirect('/user/list?e=203')
                                           })
                                       }else{
                                           res.redirect('/user/list?e=404')
                                       }
                                    });
                                }else{
                                    res.redirect('/user/list?e=405')
                                }
                            })
                        }else{
                            res.redirect('/user/list?e=406')
                        }
                    })
               }else{
                   res.redirect('/user/list?e=407')
               }
           })
       }else{
           res.redirect('/user/list?e=408')
       }
   })
});

module.exports = router;
