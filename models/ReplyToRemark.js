module.exports = function(sequelize, DataTypes) {

    var ReplyToRemark = sequelize.define('ReplyToRemark', {
    });

    ReplyToRemark.associate = function(models) {
        models.ReplyToRemark.belongsTo(models.Remark, {as: 'Reply Of'});
        models.ReplyToRemark.belongsTo(models.User, {as: 'Replied By'});
    };

    return ReplyToRemark;
};