const express = require('express');
const router = express.Router();
const models = require('../models');
const sh = require('../service/sessionHandler');
const md5 = require('md5');

router.get('/', function (req, res, next) {
    res.redirect('/login')
});

/* GET home page. */
router.get('/login', function(req, res, next) {
    const sess = sh.getSession(req);
    let c = req.query['e'];
    let returnTo = req.query['returnTo'];
    let message, type;

    switch(c) {
        case "201":
            message = "Successfully logged out.";
            type = "success";
            break;
        case "401":
            message = "Email and password do not match";
            type = "error";
            break;
        case "402":
            message = "Email does not exist.";
            type = "error";
            break;
        case "403":
            message = "You are not authorized to view this page.";
            type = "error";
            break;
        case "101":
            message = "You are not logged in.";
            type = "error";
            break;
        default:
            message = "";
            type = "";
    }

    if(sess.email===''||sess.email===null||typeof(sess.email)==='undefined'){
        res.render('auth/login',
            {
                title: 'Login',
                message: message,
                messageType: type,
                returnTo: returnTo
            }
        );
    }else{
        if(sess.role==="USER"){
            res.redirect('/user/dashboard');
        }
        if(sess.role==="ADMIN"){
            res.redirect('/admin/dashboard');
        }else{
            res.render('auth/login',
                {
                    title: 'Login',
                    message: message,
                    messageType: messageType,
                    returnTo: returnTo
                }
            );
        }
    }

});

router.post('/auth', function(req, res, next) {

    models.User.findOne({
        where: {
            email: req.body.email + req.body.address
        }
    }).then(function(result){
        if(result){
            if(result.password === md5(req.body.password)) {
                if(result.RoleId === 3) {
                    sh.setSession(req, result.id, result.name, result.email, "USER");
                    if(req.body.returnTo){
                        res.redirect(req.body.returnTo);
                    } else {
                        res.redirect('/user/dashboard');
                    }
                } else {
                    sh.setSession(req, result.id, result.name, result.email, "ADMIN");
                    if(req.body.returnTo){
                        res.redirect(req.body.returnTo);
                    } else {
                        res.redirect('/admin/dashboard');
                    }
                }
            } else {
                res.redirect('login?e=401'); // Email/Password do not match
            }
        } else {
            res.redirect('login?e=402'); // Email does not exist
        }
    })
});

router.get('/logout', function(req, res, next){
    sh.getSession(req).destroy();
    res.redirect("/login?e=201");
});

module.exports = router;
