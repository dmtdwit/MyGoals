module.exports = function(sequelize, DataTypes) {

    var User = sequelize.define('User', {
        name: {
            type:  DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        category: {
            type: DataTypes.ENUM(['EMPLOYEE','STUDENT']),
            allowNull: false
        }
    });

    User.belongsTo(User, {as: 'Manager'});

    User.associate = function (models) {
        models.User.belongsTo(models.Role);
    };

    return User;
};