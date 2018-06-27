module.exports = function(sequelize, DataTypes) {

    let Role = sequelize.define('Role', {
        authority: {
            type: DataTypes.ENUM(['USER', 'ADMIN', 'SUPERADMIN'])
        }
    });

    return Role;
};