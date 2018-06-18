module.exports = {

    setSession: function(req, id, name, email, role) {
        var sess = req.session;

        sess.id = id;
        sess.name = name;
        sess.email = email;
        sess.role = role;

        return sess;
    },
    getSession: function(req) {
        return req.session;
    }
};