module.exports = function(sequelize, DataTypes){

    let LogRemark = sequelize.define('LogRemark', {

        remark: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    LogRemark.associate = function(models) {
        models.LogRemark.belongsTo(models.Log);
        models.LogRemark.belongsTo(models.User, {as: 'Remark By'});
    };

    return LogRemark;
};