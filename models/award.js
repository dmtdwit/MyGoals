module.exports = function (sequelize, DataTypes) {

    let Award = sequelize.define('Award', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        iconName: {
            type:  DataTypes.STRING,
            allowNull: false
        },
        iconColor: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    return Award;
};