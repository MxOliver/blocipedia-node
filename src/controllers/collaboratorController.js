const collaboratorQueries = require("../db/queries.collaborators.js");
const Authorizer = require("../policies/application");
const User = require("../db/models").User;
const wikiQueries = require("../db/queries.wikis");
const userQueries = require("../db/queries.users");

module.exports = {
    addCollaborator(req, res, next){
        let newCollaborators = {
            userId: req.body.userId,
            wikiId: req.params.id
        }
        newCollaborators.forEach((newCollaborator) => {
            collaboratorQueries.createCollaborator(newCollaborator, (err, collaborator) => {
                if(err){
                    req.flash("error", err);
                } else {
                    req.flash("notice", "New collaborator addedd successfully!");
                    res.redirect(`/wikis/${req.params.id}`);
                }
            })
        })
    },
    newCollaboratorForm(req, res, next){

            wikiQueries.getWiki(req.params.id, (err, wiki) => {
                if(err || wiki == null){
                    console.log(err);
                    res.redirect(404, "/wikis");
                } else {
                    authorized = new Authorizer(req.user, wiki).addCollaborator();

                    if(authorized){
                        User.findAll().then((userList) => {
                            res.render('wikis/addCollaborator', {wiki}, {users: userList});
                        })
                        .catch((err) => {
                            console.log(err);
                        })
                    } else {
                        req.flash("notice", "You are not authorized to add collaborators to this wiki");
                        res.redirect(`/wikis/${req.params.id}`);
                    }
                }
        });
    },
}