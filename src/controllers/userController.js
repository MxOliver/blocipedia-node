const userQueries = require("../db/queries.users.js");
const passport = require("passport");
const request = require("request");
const sgMail = require('@sendgrid/mail');
const stripe = require("stripe")(process.env.STRIPE_TEST_API_KEY);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
    signUp(req, res, next){
        res.render("users/sign_up");
    },
    create(req, res, next){
        let newUser = {
            email: req.body.email,
            password: req.body.password,
            passwordConfirmation: req.body.passwordConfirmation
        };
        let messageConfirmation = {
            to: req.body.email,
            from: {
              name: 'Blocipedia',
              email: 'mxoliver@gmail.com',
            },
            subject: 'New User Confirmation',
            text: 'Your new user registration has been successfully confirmed!',
            html: '<strong>Your new user registration has been successfully confirmed!</strong>',
            templateId: "d-7e2b46b75c544d999a21997a569eca2a"
        }
        userQueries.createUser(newUser, (err, user) => {
            if(err){
                req.flash("error", err);
                res.redirect("/users/sign_up");
            } else {
                passport.authenticate("local")(req, res, () => {
                req.flash("notice", "You've successfully signed in!");
                sgMail.send(messageConfirmation);
                res.redirect("/");
              });
            }
        });
    },
    signInForm(req, res, next){
        res.render("users/sign_in");
    },
    signIn(req, res, next){
        passport.authenticate("local")(req, res, () => {
            if(!req.user){
                console.log("sign in failed");
                req.flash("notice", "Sign in failed. Please try again.")
                res.redirect("/users/sign_in");
              } else {
                req.flash("notice", "You've successfully signed in!");
                res.redirect("/");
              }
            });
    },
    signOut(req, res, next){
        req.logout();
        req.flash("notice", "You've succesfully sign out!");
        res.redirect("/");
    },
}