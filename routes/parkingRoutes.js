const express = require("express");
const parkingController = require("./../controllers/parkingController");

const router = express.Router();

router.route("/").get(parkingController.getAllParkings);

module.exports = router;
