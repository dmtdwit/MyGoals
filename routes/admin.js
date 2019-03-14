const express = require('express');
const router = express.Router();
const models = require('../models');
const sh = require('../service/sessionHandler');


router.get('/dashboard', function(req, res, next) {
    let sess = sh.getSession(req);

    sh.checkSession(req, res);

       if (sess.role === "USER") {
            res.redirect('/?e=102'); // Not authorized
       } else {
            models.User.count({
                where: {
                    RoleId: 3
                }
            }).then(function(userCount){
                models.Goal.count({
                    where: {
                        goalStatus: "COMPLETED"
                    }
                }).then(function(goalCount) {
                    models.Goal.count({
                        where: {
                            AwardId: true
                        }
                    }).then(function(awardCount) {
                        res.render('admin/dashboard', {
                            title: 'Dashboard | Deerwalk Goals',
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
