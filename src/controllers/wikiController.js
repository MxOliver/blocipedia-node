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
            collaboratorQueries.getCollaborators(req.user.id, (err, collaborators) => {
                if(err){
                    console.log(err);
                    req.flash("error", err);
                } else {
                    wikiQueries.getWikiOwners(req.user.id, (err, wikiOwners) => {
                        if(err){
                            console.log(err);
                            req.flash("error", err);
                        } else {
                            console.log(wikiOwners);

                            wikiQueries.getAllPublicWikis((err, wikis) => {
                                if(err){
                                    req.flash("error", err);
                                } else {
                                    res.render('wikis/wikis', {wikis: wikis, collaborators: collaborators, wikiOwners: wikiOwners});
                                }
                              }); 
                        }
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
                        console.log(err);
                        req.flash("error", err);
                    } else {
                        res.redirect(303, '/wikis');   
                    }
                });
            } else {
                req.flash("notice", "You must be a premium user to do that");
                res.redirect('/wikis/new');
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
            } else if(wiki.private === false || (wiki.private == true && wiki.userId == req.user.id)){
                    wiki.body = markdown.toHTML(wiki.body);
                    wiki.title = markdown.toHTML(wiki.title);
                    res.render("wikis/show", {wiki: wiki, collaborator: null});
            } else if (wiki.private == true) {
                collaboratorQueries.collaboratorAccess(wiki.id, req.user.id, (err, collaborator) => {
                    if(err || collaborator == null) {
                        req.flash("notice", "You do not have permission to view this wiki.");
                        res.redirect('/wikis');
                    } else {
                        wiki.body = markdown.toHTML(wiki.body);
                        wiki.title = markdown.toHTML(wiki.title);
                        res.render("wikis/show", {wiki: wiki, collaborator: collaborator});
                    }
                })	
            }
        })
    },
    edit(req, res, next){
       if(req.user) {
        wikiQueries.getWiki(req.params.id, (err, wiki) => {
            if(err || wiki == null){
                res.redirect(404, "/wikis");
            } else if(wiki.private === false || (wiki.private == true && wiki.userId == req.user.id)){
                    res.render("wikis/edit", {wiki});
            } else if (wiki.private == true) {
                collaboratorQueries.collaboratorAccess(wiki.id, req.user.id, (err, collaborator) => {
                    if(err || collaborator == null) {
						req.flash("notice", "You do not have permission to edit this wiki.");
						res.redirect('/wikis');
                    } else {
                        res.render("wikis/edit", {wiki});
                    }
                })	
            }
        })
       } else {
        req.flash("notice", "You must be signed in to do that.");
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
        if(req.user) {
            wikiQueries.getWiki(req.params.id, (err, wiki) => {
                if(err || wiki == null){
                    res.redirect(404, "/wikis");
                } else if(wiki.private === false || (wiki.private == true && wiki.userId == req.user.id)){
                        wikiQueries.deleteWiki(req, (err, wiki) => {
                             if(err){
                                res.redirect(error, `/wikis/${req.params.id}`);
                             } else {
                                res.redirect(303, "/wikis");
                             }
                         });
                } else if (wiki.private == true) {
                    collaboratorQueries.collaboratorAccess(wiki.id, req.user.id, (err, collaborator) => {
                        if(err || collaborator == null) {
                            req.flash("notice", "You do not have permission to delete this wiki.");
                             res.redirect(`/wikis/${req.params.id}`);
                        } else {
                            wikiQueries.deleteWiki(req, (err, wiki) => {
                                 if(err){
                                    res.redirect(error, `/wikis/${req.params.id}`);
                                 } else {
                                    res.redirect(303, "/wikis");
                                 }
                             });
                        }
                    })	
                }
            })
           } else {
            req.flash("notice", "You must be signed in to do that.");
            res.redirect(`/wikis/${req.params.id}`);
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
        collaboratorQueries.collaboratorAccess(req.params.id, req.user.id, (err, collaborator) => {
            if(err || collaborator == null) {
                req.flash("notice", "You do not have permission to edit this wiki.");
                res.redirect('/wikis');
            } else {
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
            } 
        })
    },
}