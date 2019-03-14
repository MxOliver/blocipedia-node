const wikiQueries = require("../db/queries.wikis.js");
const collaboratorQueries = require("../db/queries.collaborators.js");
const User = require("../db/models").User;
const Collaborator = require("../db/models").Collaborator;
const Wiki = require("../db/models").Wiki;
const markdown = require( "markdown" ).markdown;

const Authorizer = require("../policies/application");
const CollaboratorAuthorizer = require("../policies/collaborator");


module.exports = {
    index(req, res, next){
        
        if(!req.user || req.user.role == 0){
            wikiQueries.getAllPublicWikis((err, wikis) => {
                if(err){
                    req.flash("error", err);
                    res.redirect(404, "/");
                } else {
                    res.render('wikis/wikis', {wikis: wikis, privateWikis: null});
                }
              }); 
        } else if (req.user && req.user.role == 1){
            collaboratorQueries.getCollaborators(req.user.id, (err, collaborator) => {
                if(err){
                    console.log(err);
                    req.flash("error", err);
                } else {
                     Wiki.findByPk(collaborator.wikiId).then((privateWikis) => {
                         console.log(privateWikis); ///check if returning wiki
                         console.log(collaborator); ///check if collaborator is present
                        wikiQueries.getAllPublicWikis((err, wikis) => {
                            if(err){
                                req.flash("error", err);
                            } else {
                                res.render('wikis/wikis', {wikis: wikis, privateWikis: privateWikis});
                            }
                          }); 
                     })
                     .catch((err) => {
                         console.log(err);
                     })   
                }
            });
        }   
    },
    new(req, res, next){
        const authorized = new Authorizer(req.user).new();

        if(authorized){
            res.render('wikis/new');
        } else {
            req.flash("notice", "You must be signed in to do that");
            res.redirect("/wikis");
        }
        
    },
    create(req, res, next){
        status = {
            private: req.body.private ? false : true
        }

        if(req.user && status.private == false){
            let privateWiki = {
                title: req.body.title,
                body: req.body.body,
                userId: req.user.id,
                private: true
            }
           

            const authorized = new Authorizer(req.user).private();

            if(authorized){
                wikiQueries.addPrivateWiki(privateWiki, (err, wiki) => {
                    if(err){
                        req.flash("error", err);
                    } else {
                        res.redirect(303, '/wikis');   
                    }
                });
            } else {
                req.flash("notice", "You must be a premium user to do that");
            }
        } else if (req.user && status.private == true) {
            let publicWiki = {
                title: req.body.title,
                body: req.body.body,
                userId: req.user.id,
                private: false
            }
            

            wikiQueries.addWiki(publicWiki, (err, wiki) => {
                if(err){
                    console.log(err);
                    req.flash("error", err);
                } else {
                    res.redirect(303, '/wikis');
                }
            });
        } else if (!req.user){
            req.flash("notice", "You must be signed in to do that.");
        }
    },
    show(req, res, next){
        wikiQueries.getWiki(req.params.id, (err, wiki) => {
            if(err || wiki == null){
                res.redirect(404, "/wikis");
            } else {
                wiki.body = markdown.toHTML(wiki.body);
                wiki.title = markdown.toHTML(wiki.title);
                res.render("wikis/show", {wiki});
            }
        });
    },
    edit(req, res, next){
        if(req.user) {
            wikiQueries.getWiki(req.params.id, (err, wiki) => {
                if(err || wiki == null){
                    res.redirect(404, "/wikis");
                } else {
                    res.render(`wikis/edit`, {wiki});
                }
            });
        } else {
            res.redirect(`/wikis/${req.params.id}`);
        }
    },
    update(req, res, next){
       wikiQueries.updateWiki(req, req.body, (err, wiki) => {

        if(err || wiki == null){
            res.redirect(401, `/wikis/${req.params.id}/edit`);
        } else {
            res.redirect(`/wikis/${req.params.id}`);
        }
       });
    },
    destroy(req, res, next){
        const authorized = new Authorizer(req.user).destroy();

        if(authorized){
            wikiQueries.deleteWiki(req, (err, wiki) => {
                if(err){
                    res.redirect(error, `/wikis/${req.params.id}`);
                } else {
                    res.redirect(303, "/wikis");
                }
            });
        } else {
            res.redirect(`/wikis/${req.paramd.id}`);
        }
    },
    changeToPrivate(req, res, next){
        const authorized = new Authorizer(req.user).private();

        if(authorized){
            wikiQueries.makePrivate(req, (err, wiki) => {
                if(err){
                    console.log(err);
                    res.redirect(error, "/wikis")
                } else {
                    res.redirect(`/wikis/${req.params.id}`);
                }
            });
        } else {
            req.flash("notice", "You are not authorized to do that");
        }
    },
    changeToPublic(req, res, next){
        const authorized = new Authorizer(req.user).private();

        if(authorized){
            wikiQueries.makePublic(req, (err, wiki) => {
                if(err){
                    res.redirect(error, "/wikis");
                } else {
                    res.redirect(`/wikis/${req.params.id}`);
                }
            })
        }
    },
}