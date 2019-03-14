'use strict';
module.exports = (sequelize, DataTypes) => {
  var Collaborator = sequelize.define('Collaborator', {
    wikiId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Wikis",
        key: "id",
        as: "wikiId"
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Users",
        key: "id",
        as: "userId"
      }
    }
  }, {});
  Collaborator.associate = function(models) {
    // associations can be defined here
    Collaborator.belongsTo(models.Wiki, {
      foreignKey: "wikiId",
      as: "Wiki",
      onDelete: "CASCADE"
    });

    Collaborator.belongsTo(models.User, {
      foreignKey: "userId",
      as: "User",
      onDelete: "CASCADE"
    });

  };
  Collaborator.prototype.getWikiFor = function(wikiId){
    return this.wikis.find((wiki) => {
      return wiki.id == wikiId
    });
  };

  Collaborator.prototype.getUserFor = function(userId){
    return this.users.find((user) => {
      return user.id == userId
    });
  };

  return Collaborator;
};