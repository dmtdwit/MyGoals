module.exports = {

    setSession: function(req, id, name, email, role) {
        var sess = req.session;

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
            res.redirect('/?e=101'); // Not logged in
        }
    }
};