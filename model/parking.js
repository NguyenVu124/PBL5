const mongoose = require("mongoose");

const Parking = new mongoose.Schema({
  id_card: {
    type: Number,
    required: true,
  },
  vehicle_number: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("parking", Parking);
