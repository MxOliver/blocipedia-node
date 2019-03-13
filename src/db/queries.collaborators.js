const Collaborator = require("./models").Collaborator;

module.exports = {
    createCollaborator(newCollaborator, callback){
        Collaborator.create({newCollaborator}).then((collaborator) => {
            callback(null, collaborator);
        })
        .catch((err) => {
            callback(err);
        })
    },
}