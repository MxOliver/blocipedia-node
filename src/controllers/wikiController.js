const wikiQueries = require("../db/queries.wikis.js");
const User = require("../db/models").User;
const markdown = require( "markdown" ).markdown;

const Authorizer = require("../policies/application");

module.exports = {
    index(req, res, next){
        wikiQueries.getAllPublicWikis((error, wikis) => {
            if(error){
                res.redirect(500, "/");
            } else {
                res.render("wikis/wikis", {wikis});
            }
        })
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

            privateMarkdownWiki = markdown.toHTML(privateWiki)

            if(authorized){
                wikiQueries.addPrivateWiki(privateMarkdownWiki, (err, wiki) => {
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

            publicMarkdownWiki = markdown.toHTML(publicWiki);

            wikiQueries.addWiki(publicMarkdownWiki, (err, wiki) => {
                if(err){
                    console.log(err);
                    req.flash("error", err);
                } else {
                    console.log("no error on controller");
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
                    res.render("wikis/edit", {wiki});
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
                    res.redirect(error, "/wikis")
                } else {
                    res.redirect(`/wikis/${req.params.id}`);
                }
            });
        } else {
            req.flash("notice", "You must be a premium user to do that");
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