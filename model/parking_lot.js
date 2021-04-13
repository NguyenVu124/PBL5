const mongoose = require("mongoose");

const ParkingLot = new mongoose.Schema({
  id_parking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "parking",
  },
  status: {
    type: Boolean,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("parking_lot", ParkingLot);
