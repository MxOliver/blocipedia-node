const stripe = require("stripe")(process.env.STRIPE_TEST_API_KEY);
const request = require("request");
const passport = require("passport");
const userQueries = require("../db/queries.users");

module.exports = {
    upgradeForm(req, res, next){
        if(req.user && req.user.role == 0){
            res.render("account/upgrade");
        } else if(!req.user) {
            req.flash("notice", "You must be signed in to do that.");
            res.redirect("/users/sign_in");
        } else if (req.user && req.user.role == 1){
            req.flash("notice", "You are already a premium member. Do you wish to downgrade?");
            res.redirect("/users/downgrade");
        }
    },
    upgrade(req, res, next){
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
    },
    downgrade(req, res, next){
        userQueries.downgradeUser(req, (err, user) => {
            if(err){
                req.flash("error", err);
                res.redirect("account/downgrade");
            } else {
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
            req.flash("notice", "You are already a standard member. Do you wish to upgrade?");
            res.redirect("account/upgrade");
        }
    }
}