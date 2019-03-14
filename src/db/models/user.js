'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: { msg: "must be a valid email" }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    name: {
      type: DataTypes.STRING
    }
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.Wiki, {
      foreignKey: "userId",
      as: "Wikis"
    });

    User.hasOne(models.Collaborator, {
      foreignKey: "userId",
      as: "Collaborator"
    });
  };

  User.prototype.getWikisFor = function(id){
    return this.wikis.find((wiki) => {
      return wiki.userId = id
    });
  };

  User.prototype.getCollaboratorFor = function(id){
    return this.collaborators.find((collaborator) => {
      return collaborator.userId = id
    });
  };

  return User;
};