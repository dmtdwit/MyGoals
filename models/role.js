module.exports = function(sequelize, DataTypes) {

    var Role = sequelize.define('Role', {
        authority: {
            type: DataTypes.ENUM(['USER', 'ADMIN', 'SUPERADMIN'])
        }
    });

    return Role;
};