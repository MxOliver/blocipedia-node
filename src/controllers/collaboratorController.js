const collaboratorQueries = require("../db/queries.collaborators.js");
const Authorizer = require("../policies/application");
const User = require("../db/models").User;
const Collaborator = require("../db/models").Collaborator;
const wikiQueries = require("../db/queries.wikis");
const userQueries = require("../db/queries.users");

module.exports = {
    addCollaborator(req, res, next){
            User.findAll({where: {id: req.body.userId}}).then((users) => {
                users.forEach((user) => {
                    const authorized = new Authorizer(user)._isPremium();
                    console.log(user.role);

                    if(authorized) {
                        collaboratorQueries.createCollaborator(req.body.userId, req.params.id, (err, collaborator) => {
                            if(err){
                                console.log(err);
                                req.flash("error", err);
                            } else {
                                req.flash("notice", "New collaborator addedd successfully!");
                                res.redirect(`/wikis/${req.params.id}`);
                            }
                        })
                    } else {
                        console.log("must be premium users");
                        req.flash("notice", "Only premium users can be added as collaborators");
                        res.redirect(`/wikis/${req.params.id}/addCollaborator`);
                    }
                })
            })
            .catch((err) => {
            console.log(err);
            })
    },
    newCollaboratorForm(req, res, next){

            wikiQueries.getWiki(req.params.id, (err, wiki) => {
                if(err || wiki == null){
                    console.log(err);
                    res.redirect(404, "/wikis");
                } else {
                    authorized = new Authorizer(req.user, wiki).editCollaborator();

                    if(authorized){
                        User.findAll().then((userList) => {
                            res.render('wikis/addCollaborator', {wiki: wiki, users: userList});
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
    removeCollaborator(req, res, next){
        collaboratorQueries.deleteCollaborator(req.body.userId, (err, collaborator) => {
            if(err || collaborator == null){
                console.log(err);
                req.flash("error", err);
            } else {
                req.flash("notice", "Collaborator successfully removed!");
                res.redirect(`/wikis/${req.params.id}/removeCollaborator`);
            }
        })
    },
    removeCollaboratorForm(req, res, next){
        wikiQueries.getWiki(req.params.id, (err, wiki) => {
            if(err || wiki == null){
                console.log(err);
            } else {
               collaboratorQueries.getWikiCollaborators(req.params.id, (err, users) => {
                    if(err || users == null){
                        req.flash("error", err);
                    } else {
                        console.log("1");
                        res.render('wikis/removeCollaborator', {wiki: wiki, users: users});
                        res.done();
                    }
               })
            }
        });
    },
}