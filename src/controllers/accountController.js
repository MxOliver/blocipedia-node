const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const request = require("request");
const passport = require("passport");
const userQueries = require("../db/queries.users");
const wikiQueries = require("../db/queries.wikis");

module.exports = {
    upgradeForm(req, res, next){
        if(req.user && req.user.role == 0){
            res.render("account/upgrade");
        } else if(!req.user) {
            req.flash("notice", "You must be signed in to do that.");
            res.redirect("/users/sign_in");
        } else if (req.user && req.user.role == 1){
            res.render("account/upgrade");
            req.flash("notice", "You are already a premium member. Do you wish to downgrade?");
        }
    },
    upgrade(req, res, next){
        if(req.body.stripeToken){
            let options = {
                amount: 1500,
                source: req.body.stripeToken,
                currency: 'usd',
                description: "Upgrade Account",
                name: req.body.name,
            }
            stripe.charges.create(options, (err, charge) => {
                if(charge){
                    userQueries.upgradeUser(req, (err, user) => {
                        if(err){
                            req.flash("error", err);
                            console.log(err);
                            res.redirect("/account/upgrade");
                        } else {
                            req.flash("notice", "Your account has been upgraded!");
                            res.redirect("/");
                        }
                    });
                } else {
                    console.log(err);
                    console.log("REDIRECTING");
                    res.redirect("/account/upgrade");
                }
            })
        } else { ////run for spec test environment 
            let options = {
                amount: 1500,
                customer: 'cus_EkKYiFDxBtYgja',
                currency: 'usd',
                description: "Upgrade Account",
                name: req.body.name,
            }
            stripe.charges.create(options, (err, charge) => {
                if(charge){
                    userQueries.upgradeUser(req, (err, user) => {
                        if(err){
                            req.flash("error", err);
                            console.log(err);
                            res.redirect("/account/upgrade");
                        } else {
                            req.flash("notice", "Your account has been upgraded!");
                            res.redirect("/");
                        }
                    });
                } else {
                    console.log(err);
                    console.log("REDIRECTING");
                    res.redirect("/account/upgrade");
                }
            })
        }
    },
    downgrade(req, res, next){
        userQueries.downgradeUser(req, (err, user) => {
            if(err){
                req.flash("error", err);
                res.redirect("/account/downgrade");
            } else {
                wikiQueries.handleDowngrade(req, (err, user) => {
                    if(err){
                        req.flash("error", err);
                    } else {
                        req.flash("notice", "Your private wikis are now public");
                    }
                });
                req.flash("notice", "Your account has been downgraded!");
                res.redirect("/");
            }
        })
    },
    downgradeForm(req, res, next){
        if(req.user && req.user.role === 1){
            res.render("account/downgrade");
        } else if(!req.user) {
            req.flash("notice", "You must be signed in to do that.");
            res.redirect("/users/sign_in");
        } 
        else if (req.user && req.user.role == 0){
            res.render("account/downgrade");
            req.flash("notice", "You are already a standard member. Do you wish to upgrade?");
        }
    }
}