module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    reporterUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    entityType: {
      type: DataTypes.ENUM('rating', 'product', 'user'),
      allowNull: false,
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reason: {
      type: DataTypes.ENUM('abuse', 'spam', 'hate', 'nsfw', 'fraud', 'other'),
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('new', 'in_review', 'resolved', 'rejected'),
      allowNull: false,
      defaultValue: 'new',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  }, {
    tableName: 'Reports',
    timestamps: true,
  });

  Report.associate = (models) => {
    Report.belongsTo(models.User, {
      as: 'reporter',
      foreignKey: 'reporterUserId',
      onDelete: 'CASCADE',
    });
  };

  return Report;
};