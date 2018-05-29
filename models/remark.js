module.exports = function(sequelize, DataTypes){

    var Remark = sequelize.define('Remark', {

        remark: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    Remark.associate = function(models) {
        models.Remark.belongsTo(models.Goal);
        models.Remark.belongsTo(models.User, {as: 'Remark By'});
    };

    return Remark;
};