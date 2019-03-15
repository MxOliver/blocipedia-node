const Collaborator = require("./models").Collaborator;
const Wiki = require("./models").Wiki;
const User = require("./models").User;

module.exports = {
    createCollaborator(user, wiki, callback){
        Collaborator.create({
            userId: user,
            wikiId: wiki
        }).then((collaborator) => {
            callback(null, collaborator);
        })
        .catch((err) => {
            callback(err);
        })
    },
    deleteCollaborator(userId, callback){
        return Collaborator.findOne({where: {userId: userId}}).then((collaborator) => {
            collaborator.destroy().then(() => {
                callback(null, collaborator);
            })
            .catch((err) => {
                callback(err);
            })
        })
        .catch((err) => {
            callback(err);
        })
    },
    getWikiCollaborators(wikiId, callback){
        Collaborator.findAll({where: {wikiId: wikiId}, attributes: ['userId']}).then((collaborators) => {
            collaborators.forEach((collaborator) => {
                userId = collaborator.userId;
            });
            User.findAll({where: {id: userId}}).then((users) => {
                callback(null, users);
            })
            .catch((err) => {
                callback(err);
            })
        })
        .catch((err) => {
            callback(err);
        })
    },
    getCollaborators(userId, callback){
       Collaborator.findAll({where: {userId: userId}, include: [{model: Wiki, as: "Wiki", required: true}]}).then((collaborators) => {
            callback(null, collaborators);
        })
        .catch((err) => {
            callback(err);
       })
    },
    collaboratorAccess(wikiId, userId, callback){
        Collaborator.findOne({where: {wikiId: wikiId, userId: userId}})
        .then((collaborator) => {
            callback(null, collaborator);
        })
        .catch((err) => {
            callback(err);
        })
    }
}