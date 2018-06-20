module.exports = function (sequelize, DataTypes) {

    var Goal = sequelize.define('Goal', {
        goalType: {
            type: DataTypes.ENUM(['PERSONAL', 'ORGANIZATIONAL']),
            allowNull: false
        },
        goal: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        goalStatus: {
            type: DataTypes.ENUM(['REJECTED', 'APPROVED', 'PENDING', 'COMPLETED', 'MISSED']),
            allowNull: false
        },
        setDate: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        approvedDate: {
            type: DataTypes.DATEONLY
        },
        deadline: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        progress: {
            type: DataTypes.INTEGER
        }
    });

    Goal.associate = function(models) {
      models.Goal.belongsTo(models.User);
      models.Goal.belongsTo(models.Award);
    };

    return Goal;
};