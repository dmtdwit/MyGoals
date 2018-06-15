var express = require('express');
var router = express.Router();
var sh = require('../service/sessionHandler')


router.get('/dashboard', function(req, res, next) {
    var sess = sh.getSession(req)

        if (sess.name === undefined) {
            res.redirect('/?e=101'); // Not logged in
        } else if (sess.role !== "ADMIN") {
            res.redirect('/?e=102'); // Not authorized
        } else {
            res.render('admin/dashboard', {
                title: 'Dashboard',
                sess: sess
            });
        }
});

module.exports = router;
