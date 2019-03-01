const express = require("express");
const router = express.Router();
const passport = require("passport");

const userController = require("../controllers/userController");
const validation = require("./validation");

router.get("/users/sign_up", userController.signUp);
router.post("/users", validation.validateUsers, userController.create);

router.get("/users/sign_in", userController.signInForm);
router.post("/users/sign_in", userController.signIn, validation.validateUsers);

router.get("/users/sign_out", userController.signOut);

router.get("/users/upgrade", userController.upgradeForm);
router.post("/users/upgrade", userController.upgrade);

router.get("/users/downgrade", userController.downgradeForm);
router.post("/users/downgrade", userController.downgrade);

module.exports = router;