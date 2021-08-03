const express = require("express");
const transferDataController = require("../controllers/transferDataController");

const router = express.Router();

router.route("/in").post(transferDataController.getInData);
router.route("/getBack").post(transferDataController.getBackData);

module.exports = router;
