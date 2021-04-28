const mongoose = require("mongoose");

const ParkingLot = new mongoose.Schema({
  position: {
    type: Number,
    required: true,
  },
  id_card: {
    // type: mongoose.Schema.Types.ObjectId,
    // ref: "parking",
    type: String,
  },
  status: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model("parking_lot", ParkingLot);
