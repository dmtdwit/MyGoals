var models = require('../models');
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    var user_lists = models.User.findAll();
    console.log(user_lists);
    console.log("We are here at User page");
    res.render('user.ejs',
        {
            title: 'Users List',
            user: 'Sabin Pathak'
        }
    );
});


module.exports = router;
