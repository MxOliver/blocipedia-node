const express = require("express");
const router = express.Router();

const accountController = require("../controllers/accountController");

router.get("/account/upgrade", accountController.upgradeForm);
router.post("/account/upgrade", accountController.upgrade);

router.get("/account/downgrade", accountController.downgradeForm);
router.post("/account/downgrade", accountController.downgrade);

module.exports = router;
