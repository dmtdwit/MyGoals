module.exports = function(sequelize, DataTypes) {

    var Reply = sequelize.define('Reply', {
    });

    Reply.associate = function(models) {
        models.Reply.belongsTo(models.Remark, {as: 'Reply Of'});
        models.Reply.belongsTo(models.User, {as: 'Replied By'});
    };

    return Reply;
};