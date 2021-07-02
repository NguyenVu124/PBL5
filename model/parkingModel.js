const mongoose = require("mongoose");

const Parking = new mongoose.Schema({
  id_random: {
    type: String,
    required: true,
  },
  id_card: {
    type: String,
    required: true,
  },
  vehicle_number: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("parking", Parking);
