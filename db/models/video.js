'use strict';
module.exports = (sequelize, DataTypes) => {
  const Video = sequelize.define('Video', {
    siteId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING(256),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isUrl: true
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        min: 4
      }
    }
  }, {});
  Video.associate = function (models) {
    Video.belongsTo(models.Site, { foreignKey: 'siteId' });
    Video.hasMany(models.Flow, { foreignKey: 'videoId' });
  };
  return Video;
};