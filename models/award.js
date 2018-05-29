module.exports = function (sequelize, DataTypes) {

    var Award = sequelize.define('Award', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    return Award;
};