const md5 = require('md5');

module.exports = {

    setSession: function(req, id, name, email, role) {
        let sess = req.session;

        sess.name = name;
        sess.email = email;
        sess.role = role;
        sess.userId = id;

        return sess;
    },
    getSession: function(req) {
        return req.session;
    },
    checkSession: function (req, res) {
        if (req.session.name === undefined) {
            res.redirect('/login?e=101&returnTo='+ encodeURIComponent(req.originalUrl)); // Not logged in
        }
    },
    getBaseUrl: function () {
        return "http://localhost:3000/"
    }
};