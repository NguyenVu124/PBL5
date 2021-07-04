const express = require("express");
const historyController = require("./../controllers/historyController");

const router = express.Router();

router.route("/").get(historyController.getAllHistory);
router.route("/:id_random").get(historyController.getHistoryById);
module.exports = router;
