var express = require('express');
var router = express.Router();
var models = require('../models');
var sh = require('../service/sessionHandler');
// var md5 = require('md5');

/* GET home page. */
router.get('/', function(req, res, next) {
    var c = req.query['e'];
    var message, type;

    switch(c) {
        case "101":
            message = "Please login first.";
            type = "warn";
            break;
        case "102":
            message = "You are authorized to view this page.";
            type = "error";
            break;
        case "103":
            message = "Email/password do not match";
            type = "warn";
            break;
        case "104":
            message = "Email does not exist.";
            type = "warn";
            break;
        default:
            message = "";
    }

    res.render('auth/login',
        {
            title: 'Login',
            message: message,
            type: type
        }
    );
});

router.post('/auth', function(req, res, next) {

    models.User.findOne({
        where: {
            email: req.body.email
        }
    }).then(function(result){
        if(result){
            if(result.password === req.body.password) {

                if(result.RoleId === 2) {
                    sh.setSession(req, result.name, result.email, "USER");
                    res.redirect('/user/dashboard');
                } else {
                    sh.setSession(req, result.name, result.email, "ADMIN");
                    res.redirect('/admin/dashboard');
                }
            } else {
                res.redirect('/?e=103'); // Email/Password do not match
            }
        } else {
            res.redirect('/?e=104'); // Email does not exist
        }
    })
});

module.exports = router;
