module.exports = {

    setSession: function(req, id, name, email, role) {
        var sess = req.session;

        sess.name = name;
        sess.email = email;
        sess.role = role;
        sess.userId = id;

        console.log(sess);
        return sess;
    },
    getSession: function(req) {
        return req.session;
    }
};