var express = require('express');
var router = express.Router();
var models = require('../models');
var sh = require('../service/sessionHandler');


router.get('/dashboard', function(req, res, next) {
    var sess = sh.getSession(req);

    if (sess.name === undefined) {
        res.redirect('/?e=101'); // Not logged in
    } else if (sess.role !== "ADMIN") {
        res.redirect('/?e=102'); // Not authorized
    } else {
        models.User.count({
            where: {
                RoleId: 2
            }
        }).then(function(userCount){
            models.Goal.count({}).then(function(goalCount) {
                models.Goal.count({}).then(function(awardCount) {
                    res.render('admin/dashboard', {
                        title: 'Dashboard',
                        sess: sess,
                        users: userCount,
                        goals: goalCount,
                        awards: awardCount
                    });
                });
            });
        });
    }
});

module.exports = router;
