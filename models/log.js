module.exports = function(sequelize, DataTypes) {

    let Log = sequelize.define('Log', {
        remark: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    });

    Log.associate = function(models) {
        models.Log.belongsTo(models.Goal);
    };

    return Log;
};