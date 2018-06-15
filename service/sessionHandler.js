module.exports = {

    setSession: function(req, name, email, role) {
        var sess = req.session;

        sess.name = name;
        sess.email = email;
        sess.role = role;

        return sess;
    },
    getSession: function(req) {
        return req.session;
    }
};