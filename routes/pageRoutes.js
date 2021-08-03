const express = require("express");
const pageController = require("./../controllers/pageController");

const router = express.Router();

router.route("/in").get(pageController.inFlow);
router.route("/out").get(pageController.outFlow);

module.exports = router;
