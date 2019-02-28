const wikiQueries = require("../db/queries.wikis.js");
const User = require("../db/models").User;

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
        res.render('wikis/new');
    },
    create(req, res, next){
        let newWiki = {
            title: req.body.title,
            body: req.body.body,
            userId: req.user.id,
            private: false
        }
        if(req.user){
            wikiQueries.addWiki(newWiki, (err, wiki) => {
                if(err){
                    req.flash("error", err);
                } else {
                    res.redirect(303, '/wikis');
                }
            });
        } else {
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
        wikiQueries.getWiki(req.params.id, (err, wiki) => {
            if(err || wiki == null){
                res.redirect(404, "/wikis");
            } else {
                res.render("wikis/edit", {wiki});
            }
        });
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
        wikiQueries.deleteWiki(req, (err, wiki) => {
            if(err){
                res.redirect(error, `/wikis/${req.params.id}`);
            } else {
                res.redirect(303, "/wikis");
            }
        });
    }
}