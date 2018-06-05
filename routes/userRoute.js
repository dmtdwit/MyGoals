var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {

});

router.get('/profile', function(req, res, next) {
    res.render('user/profile',
        {
            title: 'User Profile'
        }
    );
});

module.exports = router;
