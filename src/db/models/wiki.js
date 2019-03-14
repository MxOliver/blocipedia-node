'use strict';
module.exports = (sequelize, DataTypes) => {
  var Wiki = sequelize.define('Wiki', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    body:  {
      type: DataTypes.STRING,
      allowNull: false
    },
    private: {
      type: DataTypes.BOOLEAN
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {});
  Wiki.associate = function(models) {
    // associations can be defined here
    Wiki.belongsTo(models.User, {
      foreignKey: "userId",
      as: "User",
      onDelete: "CASCADE"
    });

    Wiki.hasMany(models.Collaborator, {
      foreignKey: "wikiId",
      as: "Collaborators"
    });

    Wiki.afterCreate((wiki, callback) => {
      if(wiki.private == true){
        return models.Collaborator.create({
          userId: wiki.userId,
          wikiId: wiki.id
        });
      }
   });

  };
  Wiki.prototype.getCollaboratorsFor = function(id){
    return this.collaborators.find((collaborator) => {
      return collaborator.wikiId == id
    });
  };
  
  Wiki.prototype.getAuthorFor = function(userId){
    return this.users.find((user) => {
      return user.id == userId
    });
  };

  return Wiki;
};