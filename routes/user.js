var express = require('express');
var router = express.Router();
var models = require('../models');

/* GET users listing. */
router.get('/', function(req, res, next) {
    models.User.findAll({}).then(function(dbUser) {
        const user_lists = {
            user: dbUser
        };
        console.log("User Lists is ",user_lists);
        res.render('user/user_lists.ejs',
            {
                title: 'Users List',
                user: user_lists
            }
        );
    });
});

router.get('/profile', function(req, res, next) {
    res.render('user/profile',
        {
            title: 'User Profile'
        }
    );
});

router.get('/list', function(req, res, next) {

    models.User.findAll({
    }).then(function(users) {
        res.render('user/list', {
            title: 'All Users',
            users: users
        });
    });
});

router.get('/dashboard', function(req, res, next) {


});

module.exports = router;
